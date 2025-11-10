// client/api/proxy-upload.js
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const RENDER_URL = process.env.RENDER_URL;
  if (!RENDER_URL) {
    console.error("proxy-upload: missing RENDER_URL");
    return res.status(500).json({ error: "missing_render_url" });
  }

  try {
    // read raw incoming body into a buffer
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    // Build headers to forward - keep content-type and any auth if present
    const forwardHeaders = {};
    if (req.headers["content-type"]) forwardHeaders["content-type"] = req.headers["content-type"];
    if (req.headers["authorization"]) forwardHeaders["authorization"] = req.headers["authorization"];

    const upstreamRes = await fetch(`${RENDER_URL}/api/upload`, {
      method: "POST",
      headers: forwardHeaders,
      body: bodyBuffer,
    });

    const text = await upstreamRes.text();
    // try JSON parse
    try {
      const json = JSON.parse(text);
      // forward status and json
      return res.status(upstreamRes.status).json(json);
    } catch (e) {
      res.status(upstreamRes.status).type("text").send(text);
    }
  } catch (err) {
    console.error("proxy-upload error:", err);
    return res.status(500).json({ error: "proxy_failed", detail: err.message });
  }
}
