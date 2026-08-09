export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  const raw =
    req.method === "GET"
      ? req.query?.url
      : req.body?.url;

  const url = Array.isArray(raw) ? raw[0] : raw;

  if (!url) {
    return res.status(400).json({
      message: "URL TikTok wajib diisi"
    });
  }

  let tiktokUrl;

  try {
    tiktokUrl = new URL(url);
  } catch {
    return res.status(400).json({
      message: "URL tidak valid"
    });
  }

  const hostname = tiktokUrl.hostname.toLowerCase();

  if (
    !hostname.endsWith("tiktok.com") &&
    hostname !== "vm.tiktok.com" &&
    hostname !== "vt.tiktok.com"
  ) {
    return res.status(400).json({
      message: "URL harus berasal dari TikTok"
    });
  }

  try {
    const body = new URLSearchParams();
    body.set("url", url);
    body.set("hd", "1");

    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
        "Accept": "application/json"
      },
      body: body.toString()
    });

    if (!response.ok) {
      return res.status(502).json({
        message: "Layanan video sedang bermasalah"
      });
    }

    const json = await response.json();

    if (json.code !== 0 || !json.data) {
      return res.status(404).json({
        message:
          json.msg || "Data video tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        title: json.data.title || "",
        cover: json.data.cover || "",
        video: json.data.play || "",
        hd: json.data.hdplay || json.data.play || "",
        watermark: json.data.wmplay || "",
        music: json.data.music || ""
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal menghubungi layanan video"
    });
  }
}
