# صيانة المطاعم — Request App Golden Production Source

Version: `request-v15-20260823`
Production URL: `https://damascene-maintenance-request.vercel.app/`
Vercel project: `damascene-maintenance-request`

هذه النسخة هي Golden Source المطابقة لنشر Production بتاريخ 2026-08-23.

## سياسة النشر الإلزامية
1. لا يتم تعديل Production مباشرة بملف منفرد.
2. كل تغيير ينشر أولًا كـ Preview بالحزمة الكاملة.
3. يجب أن يحتوي النشر على الملفات الثمانية: index.html, app.js, app.css, manifest.webmanifest, sw.js, share.html, vercel.json, version.json.
4. يتم التأكد أن Build استلم 8 ملفات وأن الحالة READY.
5. بعد التحقق ينشر نفس الـbundle حرفيًا إلى Production.
6. بعد Production يتم فحص /version.json و /app.js و /app.css و /share و /sw.js.

## حماية Service Worker
`maintenance-pwa-v15` لا يخزن استجابة HTTP فاشلة. إذا تعذر تحميل ملف أساسي من الشبكة، يرجع للنسخة المخبأة السابقة بدل تخزين 404. هذا يقلل احتمال توقف التطبيق المثبت على الأجهزة عند نشر سيئ.

## تغييرات v15
- حذف الجملة التوضيحية تحت «تسجيل طلب صيانة» لتقليل المساحة.
- إضافة إظهار/إخفاء كلمة المرور.
- إضافة version.json.
- اعتماد Preview → Verify → Production Full Bundle.
