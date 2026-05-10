import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth, userId } from "../utils/auth.js";

export async function searchRoutes(app: FastifyInstance) {
  app.get("/search", { preHandler: requireAuth }, async (request) => {
    const query = z.object({ q: z.string().min(1), tags: z.string().optional(), emotion: z.string().optional() }).parse(request.query);
    const tags = query.tags?.split(",").filter(Boolean) ?? [];
    return app.prisma.memory.findMany({
      where: {
        userId: userId(request),
        AND: [
          {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { summary: { contains: query.q, mode: "insensitive" } },
              { location: { contains: query.q, mode: "insensitive" } },
              { emotion: { contains: query.q, mode: "insensitive" } }
            ]
          },
          tags.length ? { tags: { hasEvery: tags } } : {},
          query.emotion ? { emotion: { equals: query.emotion, mode: "insensitive" } } : {}
        ]
      },
      take: 30,
      orderBy: { happenedAt: "desc" }
    });
  });
}
