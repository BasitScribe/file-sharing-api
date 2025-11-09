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

// ✅ Allowed origins (local + Vercel)
const allowedOrigins = [
  process.env.CLIENT_URL,       // your deployed frontend
  "http://localhost:5173",      // local dev frontend
].filter(Boolean);

// ✅ Robust CORS setup (handles preflight)
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (mobile, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true,
};

// apply CORS globally
app.use(cors(corsOptions));
// handle preflight explicitly
app.options("*", cors(corsOptions));

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
