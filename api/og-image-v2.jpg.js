import fs from 'node:fs';
import path from 'node:path';

export default function handler(req, res) {
  try {
    const parts = Array.from({ length: 7 }, (_, i) =>
      fs.readFileSync(path.join(process.cwd(), 'assets', `banner-part-${i}.b64`), 'utf8')
    );
    const image = Buffer.from(parts.join(''), 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'inline; filename="og-image-v2.jpg"');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(image);
  } catch (error) {
    res.status(500).send('OG image unavailable');
  }
}
