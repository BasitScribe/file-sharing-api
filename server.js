// server.js
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

// help Express know it's behind a proxy (Render)
app.set("trust proxy", true);

// Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,    // e.g. https://your-vercel-site.vercel.app
  "http://localhost:5173",
].filter(Boolean);

// ===== FORCE CORS HEADERS (top-level, unconditional) =====
// Put this before any other middleware or routes to ensure headers are present
app.use((req, res, next) => {
  const originHeader = req.get("origin") || process.env.CLIENT_URL || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(originHeader) ? originHeader : originHeader,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // For preflight, write headers immediately and end response
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  // Otherwise, set headers and continue
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  next();
});

// Also apply express cors middleware (keeps semantics consistent)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

// Standard middleware
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api", uploadRouter);
app.use("/", fileRouter);

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Start
const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0";

const start = async () => {
  try {
    await connectDB();
    startCleanup();
    app.listen(PORT, HOST, () => console.log(`🚀 Server running at http://${HOST}:${PORT}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();
