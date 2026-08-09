# Capaa — siap deploy ke Vercel

## Struktur
- `index.html` — frontend
- `api/tiktok.js` — serverless proxy ke layanan TikWM
- `vercel.json` — konfigurasi Vercel

## Deploy
1. Upload folder ini ke GitHub, atau import project ke Vercel.
2. Deploy sebagai project Vercel.
3. Tidak perlu environment variable untuk versi ini.
4. Buka domain hasil deploy.

## Catatan
Fitur pengambilan video bergantung pada layanan pihak ketiga TikWM. Jika API mereka berubah, endpoint di `api/tiktok.js` perlu diperbarui.

Gunakan hanya untuk konten publik yang memang boleh kamu unduh/simpan dan hormati hak cipta serta ketentuan platform.
