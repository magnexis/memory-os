import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAuth, userId } from "../utils/auth.js";

const memoryInput = z.object({
  title: z.string().min(1).max(160),
  kind: z.enum(["MEMORY", "PROJECT", "RELATIONSHIP", "LOCATION", "IDEA", "DREAM", "MUSIC", "MEDIA"]).default("MEMORY"),
  summary: z.string().min(1).max(5000),
  happenedAt: z.coerce.date(),
  emotion: z.string().min(1).max(80),
  intensity: z.number().int().min(0).max(100).default(50),
  tags: z.array(z.string().min(1).max(48)).default([]),
  location: z.string().max(160).optional(),
  weather: z.string().max(160).optional(),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export async function memoryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.get("/memories", async (request) => {
    const query = z.object({ kind: z.string().optional(), take: z.coerce.number().min(1).max(200).default(80) }).parse(request.query);
    const cacheKey = `memories:${userId(request)}:${query.kind ?? "all"}:${query.take}`;
    const cached = await app.redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);
    const records = await app.prisma.memory.findMany({
      where: { userId: userId(request), kind: query.kind as never },
      include: { sourceLinks: true, targetLinks: true, uploads: true },
      orderBy: { happenedAt: "desc" },
      take: query.take
    });
    await app.redis.set(cacheKey, JSON.stringify(records), "EX", 20).catch(() => undefined);
    return records;
  });

  app.post("/memories", async (request, reply) => {
    const body = memoryInput.parse(request.body);
    const record = await app.prisma.memory.create({ data: { ...body, metadata: body.metadata as Prisma.InputJsonValue, userId: userId(request) } });
    await app.redis.del(`memories:${userId(request)}:all:80`).catch(() => undefined);
    reply.code(201);
    app.websocketServer.clients.forEach((client: WebSocket) => client.send(JSON.stringify({ type: "memory:pulse", message: `${record.title} entered the archive.` })));
    return record;
  });

  app.patch("/memories/:id", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = memoryInput.partial().parse(request.body);
    return app.prisma.memory.update({
      where: { id: params.id, userId: userId(request) },
      data: { ...body, metadata: body.metadata as Prisma.InputJsonValue | undefined }
    });
  });

  app.delete("/memories/:id", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    await app.prisma.memory.delete({ where: { id: params.id, userId: userId(request) } });
    return { ok: true };
  });

  app.post("/memories/:id/links", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ targetId: z.string(), label: z.string().min(1).max(80), weight: z.number().int().min(0).max(100).default(50) }).parse(request.body);
    return app.prisma.memoryLink.create({ data: { sourceId: params.id, targetId: body.targetId, label: body.label, weight: body.weight } });
  });
}
