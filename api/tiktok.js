export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  const raw = Array.isArray(req.query.url)
    ? req.query.url[0]
    : req.query.url;

  if (!raw) {
    return res.status(400).json({
      message: "URL TikTok wajib diisi"
    });
  }

  let input;

  try {
    input = new URL(raw);
  } catch {
    return res.status(400).json({
      message: "URL TikTok tidak valid"
    });
  }

  if (!input.hostname.includes("tiktok.com")) {
    return res.status(400).json({
      message: "URL harus berasal dari TikTok"
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const apiUrl =
      "https://www.tikwm.com/api/?url=" +
      encodeURIComponent(input.href) +
      "&hd=1";

    const upstream = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      signal: controller.signal
    });

    if (!upstream.ok) {
      return res.status(502).json({
        message: "Layanan downloader sedang bermasalah"
      });
    }

    const json = await upstream.json();

    if (json.code !== 0 || !json.data) {
      return res.status(400).json({
        message:
          json.msg ||
          "Video tidak ditemukan atau tidak tersedia"
      });
    }

    const data = json.data;

    const videoUrl =
      data.hdplay ||
      data.play ||
      data.wmplay;

    if (!videoUrl) {
      return res.status(404).json({
        message: "Link video tidak tersedia"
      });
    }

    return res.status(200).json({
      success: true,
      title: data.title || "TikTok Video",
      cover: data.cover || "",
      video: videoUrl,
      music: data.music || ""
    });

  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        message: "Permintaan terlalu lama"
      });
    }

    return res.status(502).json({
      message: "Gagal menghubungi layanan downloader"
    });

  } finally {
    clearTimeout(timeout);
  }
}
