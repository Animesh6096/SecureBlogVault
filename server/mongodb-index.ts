import dotenv from "dotenv";
import { createServer } from "http";
import { createApp } from "./app";
import { setupVite, serveStatic } from "./vite";
import { log } from "./log";

// Load environment variables
dotenv.config();

(async () => {
  const app = createApp();
  const server = createServer(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT) || 5001;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`MongoDB server serving on port ${port}`);
  });
})();
