import fp from "fastify-plugin";
import { Redis } from "ioredis";
import { config } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin = fp(async (app) => {
  const redis = new Redis(config.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null
  });
  let loggedUnavailable = false;
  redis.on("error", (error: Error) => {
    if (loggedUnavailable) return;
    loggedUnavailable = true;
    app.log.warn({ error }, "Redis unavailable; continuing without cache");
  });
  try {
    await redis.connect();
  } catch (error) {
    app.log.warn({ error }, "Redis connection skipped");
  }
  app.decorate("redis", redis);
  app.addHook("onClose", async () => redis.disconnect());
});
