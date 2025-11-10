export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const RENDER_URL = process.env.RENDER_URL;
  if (!RENDER_URL) return res.status(500).json({ error: "missing_render_url" });

  // Clone headers from client request but remove host to avoid conflicts
  const forwardHeaders = { ...req.headers };
  delete forwardHeaders.host;

  try {
    // forward the raw request body and headers to Render
    const upstream = await fetch(`${RENDER_URL}/api/upload`, {
      method: "POST",
      headers: forwardHeaders,
      // `req` is a readable stream — passing it directly streams the multipart content
      body: req,
      // avoid automatic redirect handling weirdness
      redirect: "manual",
    });

    // stream response back to the browser
    // copy status, headers (but avoid hop-by-hop headers)
    const forbidden = ["transfer-encoding", "content-encoding", "connection", "keep-alive"];
    upstream.headers.forEach((value, key) => {
      if (!forbidden.includes(key.toLowerCase())) res.setHeader(key, value);
    });

    res.status(upstream.status);
    const text = await upstream.text();
    // try to parse JSON safely; otherwise send raw
    try {
      const json = JSON.parse(text);
      return res.json(json);
    } catch (e) {
      return res.send(text);
    }
  } catch (err) {
    console.error("proxy-upload error:", err);
    return res.status(500).json({ error: "proxy_failed", detail: err.message });
  }
}
