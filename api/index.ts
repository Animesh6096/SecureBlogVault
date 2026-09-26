// Vercel serverless entry: all /api/* requests are rewritten here (see vercel.json).
import { createApp } from "../server/app.js";
import { registerRoutes } from "../server/routes.js";

export default createApp(registerRoutes);
