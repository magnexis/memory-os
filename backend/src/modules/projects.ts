import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../utils/auth.js";

const input = z.object({
  title: z.string().min(1).max(160),
  githubUrl: z.string().url().optional(),
  markdown: z.string().default(""),
  progress: z.number().int().min(0).max(100).default(0)
});

export async function projectRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);
  app.get("/projects", async () => app.prisma.project.findMany({ orderBy: { updatedAt: "desc" } }));
  app.post("/projects", async (request, reply) => {
    const project = await app.prisma.project.create({ data: input.parse(request.body) });
    reply.code(201);
    return project;
  });
  app.patch("/projects/:id", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    return app.prisma.project.update({ where: { id: params.id }, data: input.partial().parse(request.body) });
  });
}
