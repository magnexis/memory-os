import type { FastifyReply, FastifyRequest } from "fastify";
import { createHash } from "node:crypto";

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (bearer.startsWith("mos_")) {
    const apiKey = await request.server.prisma.apiKey.findUnique({ where: { keyHash: hashApiKey(bearer) } });
    if (apiKey?.status === "active" || apiKey?.status === "restricted") {
      await request.server.prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined);
      request.user = { sub: apiKey.userId ?? "api_consumer", apiKeyId: apiKey.id, scopes: apiKey.scopes };
      return;
    }
  }

  try {
    await request.jwtVerify();
  } catch {
    reply.unauthorized("Authentication required");
  }
}

export function userId(request: FastifyRequest) {
  return (request.user as { sub: string }).sub;
}
