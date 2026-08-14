const TARGET = 'https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory';
const ALLOWED = new Set(['login','logout','bootstrap','report_load','report_save','dashboard','history','items_admin','item_save','item_toggle']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  if (!ALLOWED.has(String(payload.action || ''))) return res.status(400).json({ ok:false, error:'Invalid action' });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const headers = { 'content-type':'application/json' };
    if (req.headers.authorization) headers.authorization = req.headers.authorization;
    const upstream = await fetch(TARGET, {
      method:'POST',
      headers,
      body:JSON.stringify(payload),
      signal:controller.signal,
    });
    const text = await upstream.text();
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Type','application/json; charset=utf-8');
    return res.status(upstream.status).send(text);
  } catch (error) {
    return res.status(error?.name === 'AbortError' ? 504 : 502).json({
      ok:false,
      error:error?.name === 'AbortError' ? 'انتهت مهلة الاتصال بخادم الجرد' : 'تعذر الاتصال بخادم الجرد'
    });
  } finally {
    clearTimeout(timer);
  }
}
