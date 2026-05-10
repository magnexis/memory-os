import type { FastifyInstance } from "fastify";

export async function systemRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "MemoryOS API",
    time: new Date().toISOString()
  }));

  app.get("/graph/stats", async () => {
    const [memories, links, uploads] = await Promise.all([
      app.prisma.memory.count(),
      app.prisma.memoryLink.count(),
      app.prisma.upload.count()
    ]);
    return { memories, links, uploads };
  });
}
