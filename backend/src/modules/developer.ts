import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { hashApiKey, requireAuth, userId } from "../utils/auth.js";

const scopes = ["memories:read", "memories:write", "media:write", "search:read", "webhooks:write"] as const;

function newApiKey(environment: "development" | "staging" | "production") {
  const prefix = environment === "production" ? "mos_live" : "mos_test";
  return `${prefix}_${randomBytes(24).toString("hex")}`;
}

export async function developerRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.get("/developer/keys", async (request) => {
    const keys = await app.prisma.apiKey.findMany({ where: { userId: userId(request) }, orderBy: { createdAt: "desc" }, take: 50 });
    return keys.map((key) => ({
      id: key.id,
      label: key.label,
      prefix: key.prefix,
      scopes: key.scopes,
      status: key.status,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt
    }));
  });

  app.post("/developer/keys", async (request, reply) => {
    const body = z.object({
      label: z.string().min(1).max(80),
      scopes: z.array(z.enum(scopes)).min(1),
      environment: z.enum(["development", "staging", "production"]).default("development")
    }).parse(request.body);
    const rawKey = newApiKey(body.environment);
    const record = await app.prisma.apiKey.create({
      data: {
        label: body.label,
        prefix: rawKey.split("_").slice(0, 2).join("_"),
        keyHash: hashApiKey(rawKey),
        scopes: body.scopes,
        status: "active",
        userId: userId(request)
      }
    });
    reply.code(201);
    return {
      id: record.id,
      label: record.label,
      key: rawKey,
      prefix: record.prefix,
      scopes: record.scopes,
      status: record.status,
      createdAt: record.createdAt
    };
  });

  app.patch("/developer/keys/:id", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ status: z.enum(["active", "restricted", "revoked"]) }).parse(request.body);
    const existing = await app.prisma.apiKey.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== userId(request)) return { error: "Key not found" };
    return app.prisma.apiKey.update({
      where: { id: params.id },
      data: { status: body.status },
      select: { id: true, label: true, prefix: true, scopes: true, status: true, createdAt: true, lastUsedAt: true }
    });
  });

  app.delete("/developer/keys/:id", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const existing = await app.prisma.apiKey.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== userId(request)) return { error: "Key not found" };
    await app.prisma.apiKey.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
