const sharp = require('sharp');

const SOURCE_URL = 'https://raw.githubusercontent.com/azwadpr-ship-it/damascene-links/main/ChatGPT2010202026%D8%8C20%D9%85.png';
let cachedImage = null;

module.exports = async function handler(req, res) {
  try {
    if (!cachedImage) {
      const response = await fetch(SOURCE_URL, {
        headers: { 'User-Agent': 'damascene-links-social-preview' }
      });

      if (!response.ok) {
        throw new Error(`Banner fetch failed: ${response.status}`);
      }

      const sourceBuffer = Buffer.from(await response.arrayBuffer());
      cachedImage = await sharp(sourceBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .flatten({ background: '#f7eddc' })
        .jpeg({ quality: 84, chromaSubsampling: '4:4:4', mozjpeg: true })
        .toBuffer();
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', String(cachedImage.length));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(cachedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Preview image unavailable');
  }
};
