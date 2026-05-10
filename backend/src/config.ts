import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4400),
  DATABASE_URL: z.string().default("postgresql://memoryos:memoryos@localhost:5432/memoryos?schema=public"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().default("dev-only-memoryos-secret-change-me"),
  COOKIE_SECRET: z.string().default("dev-only-cookie-secret-change-me"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_UPLOAD_MB: z.coerce.number().default(25)
});

export const config = schema.parse(process.env);
