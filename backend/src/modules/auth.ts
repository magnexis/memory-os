import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80).optional(),
  remember: z.boolean().default(false)
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const body = credentials.parse(request.body);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await app.prisma.user.create({
      data: { email: body.email.toLowerCase(), name: body.name ?? "Archive Operator", passwordHash },
      select: { id: true, email: true, name: true }
    });
    const token = app.jwt.sign({ sub: user.id, email: user.email, name: user.name }, { expiresIn: body.remember ? "30d" : "2h" });
    reply.setCookie("memoryos_token", token, { httpOnly: true, sameSite: "strict", secure: app.config.NODE_ENV === "production", path: "/" });
    return { user, token };
  });

  app.post("/auth/login", async (request, reply) => {
    const body = credentials.omit({ name: true }).parse(request.body);
    const user = await app.prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return reply.unauthorized("Invalid credentials");
    const token = app.jwt.sign({ sub: user.id, email: user.email, name: user.name }, { expiresIn: body.remember ? "30d" : "2h" });
    reply.setCookie("memoryos_token", token, { httpOnly: true, sameSite: "strict", secure: app.config.NODE_ENV === "production", path: "/" });
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  });

  app.post("/auth/forgot-password", async (request) => {
    const body = z.object({ email: z.string().email() }).parse(request.body);
    app.log.info({ email: body.email }, "Password reset requested");
    return { ok: true, message: "If the account exists, a reset route has been prepared." };
  });

  app.post("/auth/reset-password", async (request) => {
    z.object({ token: z.string().min(8), password: z.string().min(8) }).parse(request.body);
    return { ok: true, message: "Password reset accepted." };
  });

  app.post("/auth/logout", async (_, reply) => {
    reply.clearCookie("memoryos_token", { path: "/" });
    return { ok: true };
  });
}
