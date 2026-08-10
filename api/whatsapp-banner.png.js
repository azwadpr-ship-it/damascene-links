import fs from 'node:fs';
import path from 'node:path';

export default function handler(req, res) {
  try {
    const imagePath = path.join(process.cwd(), 'ChatGPT2010202026،20م.png');
    const image = fs.readFileSync(imagePath);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="damascene-links-banner.png"');
    res.setHeader('Content-Length', image.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(image);
  } catch (error) {
    res.status(500).send('Preview image unavailable');
  }
}
