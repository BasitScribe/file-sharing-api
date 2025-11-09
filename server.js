import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import uploadRouter from "./routes/upload.js";
import fileRouter from "./routes/file.js";
import startCleanup from "./utils/cleanup.js";

dotenv.config();

const app = express();

// CORS: explicit, safe, handles preflight
const allowedOrigins = [
  process.env.CLIENT_URL,       // e.g. https://your-vercel-app.vercel.app
  "http://localhost:5173"       // local dev
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.get('origin');
  // allow non-browser requests (curl, etc.)
  if (!origin) return next();

  // if origin is allowed, set CORS response headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // respond to preflight immediately
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ✅ Explicit CORS headers (Render + Cloudflare safe)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});



app.use(express.json());
app.use(morgan("dev"));

// ✅ Routes
app.use("/api", uploadRouter);
app.use("/", fileRouter);

// ✅ Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ Start server
const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0";

const start = async () => {
  try {
    await connectDB();
    startCleanup();
    app.listen(PORT, HOST, () =>
      console.log(`🚀 Server running at http://${HOST}:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();
