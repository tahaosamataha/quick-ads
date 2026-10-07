export interface TemplateData {
  productName: string;
  productDescription: string;
  mainImage: string;
  price: string;
  oldPrice: string;
  checkoutLink: string;
  features: { title: string; desc: string; icon: string }[];
  reviews: { name: string; content: string; rating: number }[];
  accentColor: string;
}

export const funnelTemplates = [
  {
    id: 't1',
    name: 'النموذج الاحترافي (Pro Funnel)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>${data.productName}</title>
  <link href="https://files.easy-orders.net/1730098227181565523bootstrap.css" rel="stylesheet">
  <link href="https://files.easy-orders.net/1730097959117695572normalize.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&amp;display=swap" rel="stylesheet">
  <link href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css" rel="stylesheet">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <link href="https://files.easy-orders.net/funnels-assets/sections-assets/css/style.css" rel="stylesheet">
  <link href="https://files.easy-orders.net/funnels-assets/reviews/css/style.css" rel="stylesheet">
  <link href="https://files.easy-orders.net/1738181166362778403style.css" rel="stylesheet">
  <style>
    [contenteditable="true"] { outline: 1px dashed rgba(0,0,0,0.2); }
    [contenteditable="true"]:focus { outline: 2px dashed ${data.accentColor}; background: rgba(0,0,0,0.02); }
  </style>
</head>
<body data-aos-delay="0" data-aos-duration="800" data-aos-easing="ease">
  <main id="main">
   <section id="header">
    <div class="top-head">
     <div class="container content">
      <i class="las la-bolt"></i>
      <h1 contenteditable="true">سارع في الطلب قبل:</h1>
      <div class="countdown">
       <div class="countdown-item" id="seconds"><span class="_1">ثانية</span><span class="value" id="seconds-value">46</span>:</div>
       <div class="countdown-item" id="minutes"><span class="_1">دقيقة</span><span class="value" id="minutes-value">43</span>:</div>
       <div class="countdown-item" id="hours"><span class="_1">ساعة</span><span class="value" id="hours-value">06</span>:</div>
       <div class="countdown-item" id="days"><span class="_1">يوم</span><span class="value" id="days-value">00</span></div>
      </div>
     </div>
    </div>
    <div class="bottom-head">
     <nav class="navbar container navbar-expand-lg bg-body-tertiary">
      <div class="logo d-flex align-items-center">
       <img class="logo-img" src="https://files.easy-orders.net/1731433282567060628ae768cd7-8aae-4b8d-bb63-bf16949d9ebb.svg">
       <a class="logo-name me-1" href="#" contenteditable="true">ستوريك</a>
      </div>
      <button aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler" data-bs-target="#navbarSupportedContent" data-bs-toggle="collapse" style="border: none" type="button">
       <span class="navbar-toggler-icon" style="font-size: 16px; font-weight: bold"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
       <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a aria-current="page" class="nav-link" href="#questions" contenteditable="true">أسئلة شائعة</a></li>
        <li class="nav-item"><a class="nav-link" href="#main-product-features" contenteditable="true">الميزات</a></li>
        <li class="nav-item"><a aria-current="page" class="nav-link" href="#reviews" contenteditable="true">المراجعات</a></li>
       </ul>
       <a class="order-now d-block btn-form" href="${data.checkoutLink}" id="x-checkout-btn" contenteditable="true">اشتري الان</a>
      </div>
     </nav>
    </div>
   </section>
   <section id="main">
    <div class="features-slider row-cols-lg-3 align-items-center justify-content-between d-flex flex-nowrap row-cols-2" id="top-store-features">
     <div class="feature-slide d-flex align-items-center justify-content-center">
      <p contenteditable="true">نحن نشحن دولياً</p>
      <img alt="shipping icon" src="https://files.easy-orders.net/1731499029113458742f8080114-dd18-4793-b688-24203756aee0.svg">
     </div>
     <div class="feature-slide d-flex align-items-center justify-content-center">
      <p contenteditable="true">شحن سريع ومجاني</p>
      <img alt="fast shipping icon" src="https://files.easy-orders.net/17314990291153200938d7bf7f0-8ee1-4ceb-8093-c7adaa57c5f8.svg">
     </div>
     <div class="feature-slide d-flex align-items-center justify-content-center">
      <p contenteditable="true">في طلب مرتفع جداً</p>
      <img alt="high demand icon" src="https://files.easy-orders.net/17314990291187852398213a5a3-bd8a-4a2f-aefe-8d795d805ccf.svg">
     </div>
    </div>
    <div class="container main-product-title">
     <div class="main-produt-section">
      <div class="right-side">
       <div class="carousel slide" data-ride="carousel" id="carouselExampleIndicators">
        <div class="carousel-inner">
          <div class="carousel-item active">
             <img class="d-block w-100" src="${data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}" alt="">
          </div>
        </div>
       </div>
      </div>
      <div class="col-lg-6 col-md-12 col-sm-12 left-side main-border main-product-details-left">
       <div class="row left-top d-flex flex-column product-main-title">
        <div class="left-head">
         <h1 class="headtitle" contenteditable="true">${data.productName || 'حامل جوال مغناطيسي يثبت على الصدر'}</h1>
        </div>
        <div class="left-cost">
         <div class="d-flex align-items-center">
          <div class="price-container">
           <h3 contenteditable="true">${data.price || '100 ج.م'}</h3>
           <span class="discount" contenteditable="true">${data.oldPrice || '180 ج.م'}</span>
           <h5 class="main-discount" contenteditable="true">- 45%</h5>
          </div>
         </div>
        </div>
        <div class="secure-pay-features">
         <div class="right-secure-pay-features">
          <div><img alt="" src="https://files.easy-orders.net/17315230666119590967383d92a-e3ad-44f8-ac50-9f92f9936efc.svg"></div>
          <div>
           <h3 class="subtitles-product" contenteditable="true">استرجاع خلال 30 يومًا</h3>
           <h6 class="smalltitle-product" contenteditable="true">ضمان استرداد المال</h6>
          </div>
         </div>
         <div class="right-secure-pay-features">
          <div><img alt="" src="https://files.easy-orders.net/173152306660802809413b3a43e-45d7-4f55-8a60-ea60423ed288.svg"></div>
          <div>
           <h3 class="subtitles-product" contenteditable="true">دفع آمن</h3>
           <h6 class="smalltitle-product" contenteditable="true">خيارات دفع متعددة</h6>
          </div>
         </div>
        </div>
        <div class="bottom-left-side-product">
         <a class="order-now d-block" href="${data.checkoutLink}" id="x-checkout-btn" contenteditable="true">اشتري الان</a>
         <img alt="" class="secure-pay-img" src="https://files.easy-orders.net/17315636770967464122bdea6c3-4add-49a6-aa39-5586e937de2c.svg">
        </div>
        <div class="row bottom-left-side-product">
         <!-- Accordions -->
        </div>
       </div>
      </div>
     </div>
    </div>
   </section>
   <section class="overflow-hidden" id="main-product-features">
    <div class="container">
     <div class="title-main-product-features">
      <h6 class="circeled-main-title" contenteditable="true">مميزات</h6>
      <h1 class="big-main-title" contenteditable="true">ما الذي يجعل هذا المنتج الأفضل</h1>
      <p class="small-main-title" contenteditable="true">${data.productDescription || 'وصف المنتج الرائع الذي يقدم حلول فريدة'}</p>
     </div>
     <div class="all-cards-product-features">
      ${data.features.map((f, i) => '<div class="card1-product-features"><div class="left-card1-product-features"><h2 class="big-title-card1-product-features" contenteditable="true">' + f.title + '</h2><p class="small-title-card1-product-features" contenteditable="true">' + f.desc + '</p><a class="order-now d-block btn-form" href="' + data.checkoutLink + '" contenteditable="true">اشتري الان</a></div></div>').join('')}
     </div>
    </div>
   </section>
   <section id="footer">
    <div class="container container2" contenteditable="true">
      حقوق النشر © 2024.
      <img alt="" src="https://files.easy-orders.net/17315879399124807298d0b0505-27b7-4985-8c66-ef2c222f9e9f.svg">
    </div>
   </section>
  </main>
</body>
</html>`
  },
  {
    id: 't2',
    name: 'تيلويند برو (Tailwind Minimal)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
    body { font-family: 'Tajawal', sans-serif; }
    [contenteditable="true"] { outline: 1px dashed rgba(0,0,0,0.1); }
    [contenteditable="true"]:focus { outline: 2px dashed ${data.accentColor}; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">
  <div class="bg-black text-white text-center py-2 text-sm font-bold" contenteditable="true">🔥 عرض حصري لليوم فقط! شحن مجاني!</div>
  <div class="max-w-6xl mx-auto px-4 py-16">
    <div class="flex flex-col md:flex-row items-center gap-12">
      <div class="md:w-1/2">
        <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight" contenteditable="true">${data.productName}</h1>
        <p class="text-xl text-gray-600 mb-8" contenteditable="true">${data.productDescription}</p>
        <div class="flex items-center gap-4 mb-8">
           <span class="text-4xl font-black text-red-600" contenteditable="true">${data.price}</span>
           <span class="text-2xl text-gray-400 line-through" contenteditable="true">${data.oldPrice}</span>
        </div>
        <a href="${data.checkoutLink}" class="inline-block px-12 py-5 rounded-full font-bold text-xl text-white shadow-xl hover:-translate-y-1 transition-transform" style="background-color: ${data.accentColor}" contenteditable="true">اطلب الآن واحصل على الخصم</a>
      </div>
      <div class="md:w-1/2">
        <img src="${data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}" class="rounded-3xl shadow-2xl w-full" />
      </div>
    </div>
  </div>
  <div class="bg-white py-20">
     <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-4xl font-black text-center mb-16" contenteditable="true">لماذا منتجنا هو الأفضل؟</h2>
        <div class="grid md:grid-cols-3 gap-8">
           ${data.features.map(f => '<div class="p-8 bg-gray-50 rounded-2xl border border-gray-100"><h3 class="text-2xl font-bold mb-4" contenteditable="true">' + f.title + '</h3><p class="text-gray-600" contenteditable="true">' + f.desc + '</p></div>').join('')}
        </div>
     </div>
  </div>
</body>
</html>`
  },
  {
    id: 't3',
    name: 'الوضع الليلي (Dark Mode Tech)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
    body { font-family: 'Tajawal', sans-serif; background: #0f172a; color: #f8fafc; }
    [contenteditable="true"] { outline: 1px dashed rgba(255,255,255,0.2); }
    [contenteditable="true"]:focus { outline: 2px dashed ${data.accentColor}; }
  </style>
</head>
<body>
  <div class="text-center py-3 font-bold" style="background-color: ${data.accentColor}; color: white;" contenteditable="true">🔥 الكمية تنفد بسرعة - اطلب الآن!</div>
  <main class="max-w-5xl mx-auto px-6 py-24 text-center">
    <h1 class="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-500" contenteditable="true">${data.productName}</h1>
    <p class="text-2xl text-gray-400 mb-12 max-w-3xl mx-auto" contenteditable="true">${data.productDescription}</p>
    <img src="${data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}" class="w-full h-auto rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-16" />
    
    <div class="grid md:grid-cols-2 gap-8 text-right mb-16">
      ${data.features.map(f => '<div class="bg-slate-800 p-8 rounded-3xl border border-slate-700"><h3 class="text-2xl font-bold mb-3 text-white" contenteditable="true">' + f.title + '</h3><p class="text-slate-400" contenteditable="true">' + f.desc + '</p></div>').join('')}
    </div>

    <div class="flex flex-col items-center justify-center gap-6">
       <div class="text-5xl font-black text-white" contenteditable="true">${data.price} <span class="text-xl text-slate-500 line-through">${data.oldPrice}</span></div>
       <a href="${data.checkoutLink}" class="px-16 py-6 rounded-2xl font-black text-2xl text-white shadow-[0_0_30px_${data.accentColor}80] hover:scale-105 transition-transform" style="background-color: ${data.accentColor}" contenteditable="true">اشتري الآن حصرياً</a>
    </div>
  </main>
</body>
</html>`
  },
  {
    id: 't4',
    name: 'مباشر (Direct Response)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-gray-100 text-gray-900 border-t-8" style="border-color:${data.accentColor}">
  <div class="max-w-4xl mx-auto bg-white shadow-2xl p-8 md:p-16 my-10">
    <div class="text-center mb-10"><h2 class="text-red-600 font-bold text-2xl mb-2" contenteditable="true">تحذير: لا تشتري أي منتج آخر قبل قراءة هذا!</h2><h1 class="text-5xl font-black leading-tight" contenteditable="true">${data.productName}</h1></div>
    <div class="text-xl leading-relaxed mb-8" contenteditable="true">${data.productDescription}</div>
    <img src="${data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}" class="w-full mb-10 border-4 border-gray-200" />
    <div class="bg-yellow-100 border-4 border-yellow-400 p-8 text-center mb-10">
       <div class="text-4xl font-black text-red-600 mb-4" contenteditable="true">${data.price} فقط!! (بدلاً من ${data.oldPrice})</div>
       <a href="${data.checkoutLink}" class="inline-block bg-green-600 text-white px-10 py-5 text-3xl font-black rounded shadow-xl hover:bg-green-700" contenteditable="true">✅ نعم! أريد هذا المنتج الآن</a>
    </div>
  </div>
</body></html>`
  },
  {
    id: 't5',
    name: 'عناية وتجميل (Beauty Soft)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script><style>body{font-family:serif; background:#fffcfc;}</style></head><body>
  <div class="max-w-5xl mx-auto px-6 py-20 text-center">
    <h1 class="text-6xl text-[#d4af37] mb-6 italic" contenteditable="true">${data.productName}</h1>
    <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto" contenteditable="true">${data.productDescription}</p>
    <img src="${data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}" class="w-full max-w-lg mx-auto rounded-full shadow-[0_20px_50px_rgba(212,175,55,0.2)] mb-16" />
    <a href="${data.checkoutLink}" class="inline-block px-12 py-4 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition-colors text-xl tracking-widest" contenteditable="true">اكتشفي السر الآن (${data.price})</a>
  </div>
</body></html>`
  },
  {
    id: 't6',
    name: 'تقني ومستقبلي (Gadget High-Tech)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-black text-green-400 font-mono">
  <div class="border border-green-500 m-4 p-8 max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold uppercase mb-4" contenteditable="true">> ${data.productName}_</h1>
    <p class="text-green-600 mb-8" contenteditable="true">// ${data.productDescription}</p>
    <img src="${data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}" class="w-full grayscale opacity-80 border border-green-500 mb-8" />
    <div class="text-2xl mb-8" contenteditable="true">SYS.PRICE = ${data.price}</div>
    <a href="${data.checkoutLink}" class="inline-block bg-green-500 text-black px-8 py-3 font-bold hover:bg-green-400" contenteditable="true">[EXECUTE_ORDER]</a>
  </div>
</body></html>`
  },
  {
    id: 't7',
    name: 'فلاش سيل (Flash Sale Aggressive)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-red-600 text-white">
  <div class="text-center py-16 px-4">
    <h1 class="text-7xl font-black uppercase mb-4" contenteditable="true">تصفية شاملة!</h1>
    <h2 class="text-5xl font-bold mb-8 text-yellow-300" contenteditable="true">${data.productName}</h2>
    <p class="text-2xl mb-12 max-w-3xl mx-auto" contenteditable="true">${data.productDescription}</p>
    <div class="bg-white text-black p-8 inline-block rounded-3xl mb-12 transform -rotate-2">
      <div class="text-3xl line-through text-gray-500" contenteditable="true">${data.oldPrice}</div>
      <div class="text-6xl font-black text-red-600" contenteditable="true">${data.price} فقط!!</div>
    </div><br/>
    <a href="${data.checkoutLink}" class="inline-block bg-yellow-400 text-black px-16 py-6 text-4xl font-black rounded-full shadow-2xl animate-pulse" contenteditable="true">اشتري قبل النفاذ!</a>
  </div>
</body></html>`
  },
  {
    id: 't8',
    name: 'منتج معلوماتي (Info Product)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-50 text-slate-800">
  <main class="max-w-3xl mx-auto bg-white p-12 shadow-sm my-12 border-t-4 border-blue-600">
    <h1 class="text-4xl font-bold mb-6 text-blue-900" contenteditable="true">الدليل الشامل: ${data.productName}</h1>
    <div class="prose prose-lg mb-8" contenteditable="true">${data.productDescription}</div>
    <div class="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
      <h3 class="font-bold mb-4" contenteditable="true">ماذا ستتعلم؟</h3>
      <ul class="list-disc list-inside space-y-2">
        ${data.features.map(f => '<li contenteditable="true">' + f.title + '</li>').join('')}
      </ul>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold mb-4" contenteditable="true">استثمر في نفسك مقابل ${data.price} فقط</div>
      <a href="${data.checkoutLink}" class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-blue-700" contenteditable="true">احصل على الوصول الفوري</a>
    </div>
  </main>
</body></html>`
  },
  {
    id: 't9',
    name: 'حيوي ومفعم (Vibrant E-commerce)',
    render: (data: TemplateData) => `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-amber-50 dark:bg-zinc-900">
  <div class="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
    <div class="w-full md:w-1/2">
       <span class="bg-fuchsia-200 text-fuchsia-800 px-4 py-2 rounded-full font-bold text-sm mb-6 inline-block" contenteditable="true">الأكثر مبيعاً 🌟</span>
       <h1 class="text-6xl font-black text-fuchsia-900 mb-6 drop-shadow-sm" contenteditable="true">${data.productName}</h1>
       <p class="text-xl text-fuchsia-700 mb-8" contenteditable="true">${data.productDescription}</p>
       <div class="flex items-center gap-6 mb-10">
         <div class="text-5xl font-black text-[#F0B21B]" contenteditable="true">${data.price}</div>
         <a href="${data.checkoutLink}" class="bg-[#F0B21B] text-white px-10 py-5 rounded-3xl font-bold text-xl shadow-xl hover:bg-fuchsia-700 hover:-translate-y-1 transition-all" contenteditable="true">أضف للسلة</a>
       </div>
    </div>
    <div class="w-full md:w-1/2 relative">
       <div class="absolute inset-0 bg-fuchsia-400 rounded-full blur-3xl opacity-30"></div>
       <img src="${data.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}" class="relative w-full rounded-tr-[100px] rounded-bl-[100px] shadow-2xl border-4 border-white" />
    </div>
  </div>
</body></html>`
  }
];
