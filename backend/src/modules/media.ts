import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import type { FastifyInstance } from "fastify";
import sanitize from "sanitize-filename";
import sharp from "sharp";
import { z } from "zod";
import { config } from "../config.js";
import { requireAuth, userId } from "../utils/auth.js";

export async function mediaRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.post("/media/upload", async (request, reply) => {
    const file = await request.file({ limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024 } });
    if (!file) return reply.badRequest("File is required");
    const allowed = ["image/png", "image/jpeg", "image/webp", "video/mp4", "audio/mpeg", "audio/wav", "application/pdf"];
    if (!allowed.includes(file.mimetype)) return reply.unsupportedMediaType("Unsupported media type");
    const safeName = `${Date.now()}-${sanitize(file.filename)}`;
    const path = join(config.UPLOAD_DIR, safeName);
    await mkdir(dirname(path), { recursive: true });
    await pipeline(file.file, createWriteStream(path));
    let thumbnailPath: string | undefined;
    if (file.mimetype.startsWith("image/")) {
      thumbnailPath = join(config.UPLOAD_DIR, `thumb-${safeName}.webp`);
      await sharp(path).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 78 }).toFile(thumbnailPath);
    }
    const record = await app.prisma.upload.create({
      data: {
        userId: userId(request),
        fileName: file.filename,
        mimeType: file.mimetype,
        size: Number(file.fields.size ?? 0),
        path,
        thumbnailPath,
        metadata: { encoding: file.encoding }
      }
    });
    reply.code(201);
    return record;
  });

  app.get("/media", async (request) => {
    const query = z.object({ take: z.coerce.number().min(1).max(100).default(40) }).parse(request.query);
    return app.prisma.upload.findMany({ where: { userId: userId(request) }, take: query.take, orderBy: { createdAt: "desc" } });
  });
}
