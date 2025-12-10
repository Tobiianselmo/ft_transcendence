 

import 'dotenv/config';
import Fastify from "fastify"
import fastifyJwt from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"
import fastifyMultipart from "@fastify/multipart"
import fastifyStatic from "@fastify/static"
import path from "path"
import { userRoutes } from "./routes/userRoutes"
import { initializeDatabase } from "./db/init"
import cors from "@fastify/cors"
import { setupSocketIO } from "./socket"
import type { Server } from "http"
import { cleanExpiredUnverifiedUsers } from "./utils/cleanup"

const start = async () => {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  })

  await app.register(fastifyCookie)

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "supersecret",
    cookie: {
      cookieName: "token",
      signed: false,
    },
  })

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-csrf-token", "Authorization", "Accept"],
  })

  await app.register(fastifyMultipart, {
    limits: { fileSize: 2 * 1024 * 1024 },  
  })

  const uploadsRoot = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(__dirname, "uploads");

  await app.register(fastifyStatic, {
    root: uploadsRoot,
    prefix: "/uploads/",
  })

  app.register(userRoutes)

  app.get("/", async () => {
    return { message: "Server is running!" }
  })

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() }
  })

  await initializeDatabase()

  setInterval(async () => {
    try {
      await cleanExpiredUnverifiedUsers();
    } catch (err) {
      app.log.error(`Error cleaning unverified users: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, 60 * 1000)

  const address = await app.listen({ port: 3000, host: "0.0.0.0" })

  const server = app.server as Server
  setupSocketIO(app, server)
}

start().catch((err) => {
  console.error("Error initializing server:", err)
  process.exit(1)
})