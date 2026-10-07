export const easyOrdersBaseCss = `
        /* === الإعدادات الأساسية === */
        body { font-family: 'Cairo', sans-serif; background-color: #faf5ff; margin: 0; padding: 0; color: #1e293b; }
        .landing-container { max-width: 480px; margin: 0 auto; background: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.05); padding-bottom: 20px; overflow: hidden; }

        /* === 1. شريط الثقة العلوي === */
        .trust-bar { background-color: var(--primary-color, #6d28d9); color: #ffffff; text-align: center; padding: 10px; font-size: 14px; font-weight: 900; }

        /* === 2. بوكس السعر العلوي === */
        .top-price-section { padding: 15px; margin-top: 5px; }
        .top-price-card {
            background: linear-gradient(to left, #f3e8ff, #e0e7ff); 
            border: 2px dashed var(--primary-color, #8b5cf6); border-radius: 15px; padding: 20px 15px;
            display: flex; align-items: center; justify-content: space-between; position: relative;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.15);
        }
        .top-badge {
            position: absolute; top: -14px; right: 15px; background: #f59e0b; color: white;
            font-size: 13px; font-weight: 900; padding: 5px 15px; border-radius: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .top-price-details { text-align: center; flex: 1; padding-left: 10px; }
        .top-old-price { text-decoration: line-through; color: #64748b; font-size: 15px; font-weight: 700; display: block; margin-bottom: 2px;}
        .top-new-price { font-size: 44px; font-weight: 900; color: var(--primary-color, #6d28d9); line-height: 1; display: block; text-shadow: 2px 2px 0px #ddd6fe;}
        .top-new-price span { font-size: 18px; color: #5b21b6; }
        .top-shipping { font-size: 13px; background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 800; display: inline-block; margin-top: 8px;}
        .top-price-card img {
            width: 100px; height: 100px; border-radius: 12px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); object-fit: cover; background-color: #000;
        }

        /* === 3. زر الطلب العلوي === */
        .main-cta-btn {
            display: block; background: linear-gradient(90deg, var(--primary-color, #7c3aed), var(--primary-color, #6d28d9)); color: #ffffff; text-align: center; padding: 14px;
            border-radius: 12px; font-size: 22px; font-weight: 900; text-decoration: none;
            box-shadow: 0 6px 15px rgba(109, 40, 217, 0.4); margin-top: 15px; animation: bounceIn 2s infinite;
        }
        @keyframes bounceIn { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } 60% { transform: translateY(-4px); } }

        /* === 4. العناوين الحيوية === */
        .hero-section { padding: 10px 15px; text-align: center; }
        .hero-title { font-size: 24px; font-weight: 900; color: #1e293b; line-height: 1.5; margin-bottom: 15px; }
        .pulse-text { display: inline-block; color: var(--primary-color, #7c3aed); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .circle-text { position: relative; display: inline-block; z-index: 1; color: #f59e0b;}
        .circle-text::after { content: ''; position: absolute; bottom: 4px; left: -5px; right: -5px; height: 12px; background: rgba(245, 158, 11, 0.2); border-radius: 50%; z-index: -1; transform: rotate(-3deg); }

        /* === 5. الفيديو والصور === */
        .locked-video { width: 100%; border-radius: 12px; box-shadow: 0 4px 10px rgba(109, 40, 217, 0.2); border: 2px solid #ddd6fe; pointer-events: none; outline: none; background: #000; }
        .pain-section { background: #fff; padding: 20px 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; border: 2px solid #ddd6fe; margin: 20px 15px;}
        .pain-text { font-size: 16px; font-weight: 700; color: #334155; margin: 0; line-height: 1.6; }
        .gallery-img { width: 100%; border-radius: 10px; margin-bottom: 12px; border: 1px solid #e2e8f0; }
        
        /* === 6. 🎁 بوكس باقات التوفير === */
        .bundle-promo-box { background: #fff; border: 2px solid var(--primary-color, #7c3aed); border-radius: 15px; margin: 25px 15px; padding: 20px 15px; text-align: center; box-shadow: 0 8px 20px rgba(109,40,217,0.15); position: relative; overflow: hidden; }
        .bundle-promo-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: repeating-linear-gradient(45deg, var(--primary-color, #7c3aed), var(--primary-color, #7c3aed) 10px, #ddd6fe 10px, #ddd6fe 20px); }
        .bundle-title { font-size: 20px; font-weight: 900; color: var(--primary-color, #6d28d9); margin-top: 10px; margin-bottom: 15px; }
        .bundle-item { background: #faf5ff; border: 1px dashed #c4b5fd; padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .bundle-name { font-weight: 900; color: #1e293b; font-size: 15px; }
        .bundle-price { font-weight: 900; color: #f59e0b; font-size: 18px; display: flex; align-items: center; gap: 8px;}
        .discount-tag { font-size: 11px; background: var(--primary-color, #7c3aed); color: white; padding: 3px 6px; border-radius: 5px; font-weight: 900;}
        .bundle-promo-btn { display: block; background: #f59e0b; color: #fff; padding: 12px; border-radius: 10px; font-weight: 900; text-decoration: none; margin-top: 15px; font-size: 18px; box-shadow: 0 4px 10px rgba(245,158,11,0.3);}

        /* === 7. قسم المميزات === */
        .features-section { padding: 20px 15px; background-color: #faf5ff; }
        .section-title { text-align: center; font-size: 22px; font-weight: 900; color: var(--primary-color, #6d28d9); margin-bottom: 20px; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .feature-card { background: #ffffff; border: 1px solid #ddd6fe; padding: 15px 10px; border-radius: 12px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .feature-icon { font-size: 30px; margin-bottom: 8px; }
        .feature-text { font-size: 13px; font-weight: 700; color: #1e293b; }

        /* ========================================= */
        /* 🛠️ أكواد اختراق EasyOrders (النسف الشامل للشوائب) */
        /* ========================================= */
        #tabs, .breadcrumb { display: none !important; }
        
        /* 🔥 أكواد إخفاء السعر الأصلي (محددة لتجنب إخفاء الأقسام) 🔥 */
        .price-wrapper, 
        .product-price-container { 
            display: none !important; 
        }
        
        /* استثناءات مهمة عشان ما يخفي تصميمنا */
        .landing-container div.text-center { display: block !important; }
        .trust-bar, .top-price-details, .bundle-promo-box, .section-title, .feature-card { display: block !important; }

        /* تجميل البندلز (Bundles) */
        div.mt-6.px-2\\.5:not(.product_form_checkout) { background: transparent !important; border: none !important; box-shadow: none !important; margin-bottom: 30px !important; }
        div.mt-6.px-2\\.5:not(.product_form_checkout) .mb-5 { background-color: #faf5ff !important; border: 2px solid var(--primary-color, #8b5cf6) !important; border-radius: 12px !important;}
        div.mt-6.px-2\\.5:not(.product_form_checkout) div.bg-white { background-color: #ffffff !important; border-color: #ddd6fe !important; }

        /* البادج الأصفر للمنصة (وفر كذا) */
        div.mt-6.px-2\\.5:not(.product_form_checkout) div.bg-\\[\\#FDE047\\] {
            background: linear-gradient(90deg, var(--primary-color, #7c3aed), var(--primary-color, #6d28d9)) !important; color: #fff !important; font-size: 14px !important; text-align: center !important; font-weight: 900 !important; margin: 10px auto 5px auto !important; padding: 6px 15px !important; border-radius: 50px !important; width: 90% !important; display: block !important;
        }

        /* تجميل نموذج الشراء (Checkout) */
        .product_form_checkout { background: #faf5ff !important; padding: 50px 15px 25px 15px !important; margin: 0 auto !important; border-top: 4px dashed var(--primary-color, #7c3aed) !important; direction: rtl !important; position: relative; border-radius: 15px;}
        .product_form_checkout::before { content: "أكمل بياناتك للحجز (الطلب سهل جداً) 👇"; position: absolute; top: 15px; left: 0; width: 100%; text-align: center; color: var(--primary-color, #5b21b6); font-weight: 900; font-size: 18px; font-family: 'Cairo', sans-serif; }
        .product_form_checkout .mb-5 { display: none !important; }
        .shipping_cost_container { display: none !important; }

        /* صندوق الإجمالي */
        .total_price_container { background: #ffffff !important; padding: 15px !important; border-radius: 10px !important; border: 2px dashed #f59e0b !important; margin: 15px 0 !important; display: flex !important; flex-direction: column; align-items: center; position: relative; box-shadow: 0 4px 6px rgba(245,158,11,0.05) !important;}
        .total_price_container dt { visibility: hidden; position: absolute;}
        .total_price_container::before { content: "الإجمالي (شامل الشحن والتوصيل):"; visibility: visible; font-weight: 900; color: #1e293b; font-size: 15px; margin-bottom: 5px; }
        .total_price { font-size: 32px !important; font-weight: 900 !important; color: var(--primary-color, #6d28d9) !important; line-height: 1 !important;}
        .total_price_container::after { content: "🤝 الدفع عند الاستلام"; display: block; width: 90%; border-top: 1px dashed #ddd6fe; padding-top: 10px; margin-top: 10px; font-size: 15px; color: var(--primary-color, #7c3aed); font-weight: 900; text-align: center; }

        .form_checkout_btn { background: #f59e0b !important; color: #fff !important; border-radius: 12px !important; font-weight: 900 !important; font-size: 24px !important; padding: 15px !important; border: none !important; width: 100% !important; box-shadow: 0 4px 10px rgba(245,158,11,0.3) !important; }
`;
