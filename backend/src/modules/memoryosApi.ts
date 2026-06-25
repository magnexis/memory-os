import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { hashApiKey, userId } from "../utils/auth.js";

async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  const key = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!key.startsWith("mos_")) return reply.unauthorized("MemoryOS API key required");

  const record = await request.server.prisma.apiKey.findUnique({ where: { keyHash: hashApiKey(key) } });
  if (!record || record.status === "revoked") return reply.unauthorized("Invalid MemoryOS API key");
  await request.server.prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined);
  request.user = { sub: record.userId ?? "api_consumer", apiKeyId: record.id, scopes: record.scopes };
}

function hasScope(request: FastifyRequest, scope: string) {
  return ((request.user as { scopes?: string[] })?.scopes ?? []).includes(scope);
}

export async function memoryOsApiRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireApiKey);

  app.get("/v1/status", async (request) => ({
    service: "MemoryOS API",
    authenticated: true,
    scopes: (request.user as { scopes?: string[] }).scopes ?? [],
    time: new Date().toISOString()
  }));

  app.get("/v1/memories", async (request, reply) => {
    if (!hasScope(request, "memories:read")) return reply.forbidden("Missing memories:read scope");
    const query = z.object({ take: z.coerce.number().min(1).max(100).default(25) }).parse(request.query);
    const records = await app.prisma.memory.findMany({
      where: { userId: userId(request) },
      orderBy: { happenedAt: "desc" },
      take: query.take,
      select: { id: true, title: true, kind: true, summary: true, happenedAt: true, emotion: true, tags: true, location: true, intensity: true }
    });
    return { data: records };
  });

  app.get("/v1/graph", async (request, reply) => {
    if (!hasScope(request, "memories:read")) return reply.forbidden("Missing memories:read scope");
    const uid = userId(request);
    const [memories, links, uploads] = await Promise.all([
      app.prisma.memory.count({ where: { userId: uid } }),
      app.prisma.memoryLink.count({ where: { source: { userId: uid } } }),
      app.prisma.upload.count({ where: { userId: uid } })
    ]);
    return { data: { memories, links, uploads } };
  });

  app.get("/v1/search", async (request, reply) => {
    if (!hasScope(request, "search:read")) return reply.forbidden("Missing search:read scope");
    const query = z.object({ q: z.string().min(1).max(120) }).parse(request.query);
    const records = await app.prisma.memory.findMany({
      where: {
        userId: userId(request),
        OR: [
          { title: { contains: query.q, mode: "insensitive" } },
          { summary: { contains: query.q, mode: "insensitive" } },
          { tags: { has: query.q } }
        ]
      },
      take: 20,
      select: { id: true, title: true, kind: true, summary: true, happenedAt: true, tags: true }
    });
    return { data: records };
  });
}
