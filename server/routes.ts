import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  void httpServer;

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Return a proper API 404 instead of falling through to the SPA index.html.
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "API route not found" });
  });

  return httpServer;
}
