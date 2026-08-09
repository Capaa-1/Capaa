export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const raw = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
  if (!raw) return res.status(400).json({ message: "URL TikTok wajib diisi" });

  let input;
  try {
    input = new URL(raw);
  } catch {
    return res.status(400).json({ message: "URL tidak valid" });
  }

  if (!/(^|\.)tiktok\.com$/i.test(input.hostname)) {
    return res.status(400).json({ message: "URL harus berasal dari TikTok" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const apiUrl =
      "https://www.tikwm.com/api/?url=" +
      encodeURIComponent(input.href) +
      "&hd=1";

    const upstream = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Capaa/1.0"
      },
      signal: controller.signal
    });

    if (!upstream.ok) {
      return res.status(502).json({ message: "Layanan video sedang tidak tersedia" });
    }

    const json = await upstream.json();

    if (json?.code !== 0 || !json?.data) {
      return res.status(404).json({ message: "Data video tidak ditemukan" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ data: json.data });
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({ message: "Permintaan timeout" });
    }
    return res.status(502).json({ message: "Gagal menghubungi layanan video" });
  } finally {
    clearTimeout(timeout);
  }
}