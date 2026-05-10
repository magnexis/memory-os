import type { FastifyInstance } from "fastify";
import { requireAuth, userId } from "../utils/auth.js";

const dayMs = 24 * 60 * 60 * 1000;

export async function smartLinkRoutes(app: FastifyInstance) {
  app.get("/smart-links", { preHandler: requireAuth }, async (request) => {
    const [memories, links] = await Promise.all([
      app.prisma.memory.findMany({ where: { userId: userId(request) }, orderBy: { happenedAt: "desc" }, take: 200 }),
      app.prisma.memoryLink.findMany({
        where: {
          OR: [
            { source: { userId: userId(request) } },
            { target: { userId: userId(request) } }
          ]
        }
      })
    ]);
    const existing = new Set(links.flatMap((link) => [`${link.sourceId}:${link.targetId}`, `${link.targetId}:${link.sourceId}`]));

    return memories.flatMap((source, sourceIndex) =>
      memories.slice(sourceIndex + 1).map((target) => {
        if (existing.has(`${source.id}:${target.id}`)) return null;
        const sharedTags = source.tags.filter((tag) => target.tags.includes(tag));
        const sameLocation = source.location && target.location && source.location === target.location;
        const sameEmotion = source.emotion === target.emotion;
        const nearbyDate = Math.abs(source.happenedAt.getTime() - target.happenedAt.getTime()) / dayMs <= 45;
        const strength = sharedTags.length * 24 + (sameLocation ? 28 : 0) + (sameEmotion ? 14 : 0) + (nearbyDate ? 18 : 0);
        const reasons = [
          sharedTags.length ? `shared tags: ${sharedTags.join(", ")}` : "",
          sameLocation ? `same location: ${source.location}` : "",
          sameEmotion ? `same emotional tone: ${source.emotion}` : "",
          nearbyDate ? "nearby dates" : ""
        ].filter(Boolean);
        return strength >= 28 ? { sourceId: source.id, targetId: target.id, strength, reasons } : null;
      })
    ).filter(Boolean).sort((a, b) => (b?.strength ?? 0) - (a?.strength ?? 0)).slice(0, 20);
  });
}
