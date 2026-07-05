import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Health check
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Setup Vite or Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: 24700, // Fixed HMR port to avoid conflicts
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ Server running at http://localhost:${PORT}\n`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n❌ Port ${PORT} is already in use!\n` +
        `   Fix: Run this command first to free it:\n` +
        `   taskkill /F /IM node.exe\n` +
        `   Then run: npm run dev\n`
      );
      process.exit(1);
    } else {
      throw err;
    }
  });
}

startServer();
