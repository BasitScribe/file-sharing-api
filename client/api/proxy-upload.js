export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RENDER_URL = process.env.RENDER_URL;
  if (!RENDER_URL) {
    console.error("❌ proxy-upload: missing RENDER_URL env variable");
    return res.status(500).json({ error: "missing_render_url" });
  }

  try {
    // Collect request body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    // Forward the request to Render
    const response = await fetch(`${RENDER_URL}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"] || "application/octet-stream",
      },
      body: bodyBuffer,
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return res.status(response.status).json(json);
    } catch {
      return res.status(response.status).send(text);
    }
  } catch (err) {
    console.error("❌ proxy-upload error:", err);
    return res.status(500).json({ error: "proxy_failed", detail: err.message });
  }
}
