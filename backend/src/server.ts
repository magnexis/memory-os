import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import csrf from "@fastify/csrf-protection";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import websocket from "@fastify/websocket";
import { config } from "./config.js";
import { authRoutes } from "./modules/auth.js";
import { developerRoutes } from "./modules/developer.js";
import { mediaRoutes } from "./modules/media.js";
import { memoryRoutes } from "./modules/memories.js";
import { memoryOsApiRoutes } from "./modules/memoryosApi.js";
import { projectRoutes } from "./modules/projects.js";
import { searchRoutes } from "./modules/search.js";
import { smartLinkRoutes } from "./modules/smartLinks.js";
import { systemRoutes } from "./modules/system.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { redisPlugin } from "./plugins/redis.js";

declare module "fastify" {
  interface FastifyInstance {
    config: typeof config;
  }
}

const app = Fastify({
  logger: {
    level: config.NODE_ENV === "production" ? "info" : "debug",
    redact: ["req.headers.authorization", "req.cookies.memoryos_token"]
  }
});

app.decorate("config", config);
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, { origin: config.FRONTEND_ORIGIN, credentials: true });
await app.register(cookie, { secret: config.COOKIE_SECRET });
await app.register(csrf, { cookieOpts: { sameSite: "strict", path: "/" } });
await app.register(rateLimit, { max: 160, timeWindow: "1 minute" });
await app.register(sensible);
await app.register(jwt, {
  secret: config.JWT_SECRET,
  cookie: { cookieName: "memoryos_token", signed: false }
});
await app.register(multipart);
await app.register(websocket);
await app.register(prismaPlugin);
await app.register(redisPlugin);

app.register(async (api) => {
  await api.register(systemRoutes);
  await api.register(authRoutes);
  await api.register(developerRoutes);
  await api.register(memoryRoutes);
  await api.register(searchRoutes);
  await api.register(mediaRoutes);
  await api.register(projectRoutes);
  await api.register(smartLinkRoutes);
  await api.register(memoryOsApiRoutes);
}, { prefix: "/api" });

app.get("/realtime", { websocket: true }, (socket) => {
  socket.send(JSON.stringify({ type: "memory:pulse", message: "Realtime neural channel established." }));
  const interval = setInterval(() => {
    socket.send(JSON.stringify({ type: "memory:pulse", message: "Archive pulse: graph links remain synchronized." }));
  }, 30000);
  socket.on("close", () => clearInterval(interval));
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const handled = error as Error & { statusCode?: number };
  const status = handled.statusCode ?? 500;
  reply.status(status).send({
    error: status >= 500 ? "Internal server error" : handled.message,
    statusCode: status
  });
});

await app.listen({ port: config.PORT, host: "0.0.0.0" });
