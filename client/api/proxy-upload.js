// // client/api/proxy-upload.js  (temporary debug)
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // 1) basic method guard
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, reason: "Method not allowed" });
  }

  // 2) show the env var value (masked)
  const rawUrl = process.env.RENDER_URL || null;
  const masked = rawUrl ? rawUrl.replace(/(https?:\/\/)(.+)/, "$1<RENDER_URL>") : null;

  // 3) try to read the body into a buffer and measure size (safe small-file test)
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks || []);
    return res.status(200).json({
      ok: true,
      renderUrlConfigured: !!rawUrl,
      renderUrlMasked: masked,
      bodyBytes: buf.length
    });
  } catch (err) {
    console.error("DEBUG proxy read error:", err);
    return res.status(500).json({ ok: false, error: "read_failed", detail: err.message });
  }
}
