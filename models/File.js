import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // we'll use nanoid
  originalName: { type: String },
  storageUrl: { type: String },
  publicId: { type: String },
  size: { type: Number },
  contentType: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: true },
  downloads: { type: Number, default: 0 },
});

// Optional TTL index (Mongo auto-delete metadata)
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ ESM-compatible export
export default mongoose.model("File", FileSchema);
