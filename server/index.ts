import dotenv from "dotenv";
// Load env before anything reads it: .env.local comes from `vercel env pull`
dotenv.config({ path: [".env.local", ".env"] });

const { createServer } = await import("http");
const { createApp } = await import("./app");
const { registerRoutes } = await import("./routes");
const { setupVite, serveStatic } = await import("./vite");
const { log } = await import("./log");

const app = createApp(registerRoutes);
const server = createServer(app);

// importantly only setup vite in development and after
// setting up all the other routes so the catch-all route
// doesn't interfere with the other routes
if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

const port = Number(process.env.PORT) || 5000;
server.listen({ port, host: "0.0.0.0" }, () => {
  log(`serving on port ${port}`);
});
