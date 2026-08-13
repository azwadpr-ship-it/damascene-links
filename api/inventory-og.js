const sharp = require('sharp');

module.exports = async function handler(req, res) {
  try {
    const sourceUrl = 'https://damascene-links.vercel.app/inventory/inventory-og-whatsapp.png';
    const response = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Damascene-Inventory-OG/1.0' }
    });

    if (!response.ok) {
      res.status(502).send('Unable to load source image');
      return;
    }

    const input = Buffer.from(await response.arrayBuffer());
    const output = await sharp(input)
      .resize(1200, 630, { fit: 'fill' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', String(output.length));
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(output);
  } catch (error) {
    console.error('inventory-og error', error);
    res.status(500).send('Image generation failed');
  }
};
