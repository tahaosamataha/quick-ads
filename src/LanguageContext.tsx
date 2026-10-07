import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  "Home": { "ar": "الرئيسية", "en": "Home" },
  "Product Analysis": { "ar": "تحليل المنتج", "en": "Product Analysis" },
  "تسعير المنتج": { "ar": "تسعير المنتج", "en": "Product Pricing" },
  "سجل المشاريع": { "ar": "سجل المشاريع", "en": "Projects History" },
  "الإعدادات / المستخدمين": { "ar": "الإعدادات / المستخدمين", "en": "Settings / Users" },
  "Settings / Users": { "ar": "الإعدادات / المستخدمين", "en": "Settings / Users" },
  "Settings": { "ar": "الإعدادات", "en": "Settings" },
  "Account": { "ar": "الحساب", "en": "Account" },
  "طول المحتوى (Copy Length)": { "ar": "طول المحتوى (Copy Length)", "en": "Copy Length" },
  "تلقائي (الأفضل للمنتج)": { "ar": "تلقائي (الأفضل للمنتج)", "en": "Auto (Best for Product)" },
  "قصير ومباشر (Short)": { "ar": "قصير ومباشر (Short)", "en": "Short and Direct" },
  "طويل ومفصل (Long)": { "ar": "طويل ومفصل (Long)", "en": "Long and Detailed" },
  "الاشتراك والباقات": { "ar": "الاشتراك والباقات", "en": "Subscriptions & Billing" },
  "الباقات والاشتراك": { "ar": "الباقات والاشتراك", "en": "Subscriptions & Billing" },
  "تطبيق البراند كيت": { "ar": "تطبيق البراند كيت", "en": "Brand Kits" },
  "الربط مع المنصات": { "ar": "الربط مع المنصات", "en": "Integrations" },
  "فريق العمل (Agency)": { "ar": "فريق العمل (Agency)", "en": "Team (Agency)" },
  "إدارة المستخدمين": { "ar": "إدارة المستخدمين", "en": "User Management" },
  "Agency Balance": { "ar": "رصيد الوكالة", "en": "Agency Balance" },
  "Tokens": { "ar": "توكينز", "en": "Tokens" },
  "Buy More Tokens": { "ar": "شراء توكينز إضافية", "en": "Buy More Tokens" },
  "Switch to User View": { "ar": "التبديل لواجهة المستخدم", "en": "Switch to User View" },
  "Switch to Agency Admin": { "ar": "التبديل لواجهة الإدارة", "en": "Switch to Agency Admin" },
  "Member": { "ar": "عضو", "en": "Member" },
  "Admin": { "ar": "مدير", "en": "Admin" },
  "Owner": { "ar": "مالك", "en": "Owner" },
  "Free": { "ar": "مجانية", "en": "Free" },
  "Pro": { "ar": "برو", "en": "Pro" },
  "Agency": { "ar": "وكالة", "en": "Agency" },
  "Save": { "ar": "حفظ", "en": "Save" },
  "Saved": { "ar": "تم الحفظ", "en": "Saved" },
  "Email": { "ar": "البريد الإلكتروني", "en": "Email" },
  "Role": { "ar": "الصلاحية", "en": "Role" },
  "Plan": { "ar": "الباقة", "en": "Plan" },
  "Actions": { "ar": "إجراءات", "en": "Actions" },
  "إدارة النظام والمستخدمين": { "ar": "إدارة النظام والمستخدمين", "en": "System and User Management" },
  "تحكم بالرصيد والباقات والوصول لكل مستخدم.": { "ar": "تحكم بالرصيد والباقات والوصول لكل مستخدم.", "en": "Control balance, plans, and access for each user." },
  "ابحث بالايميل...": { "ar": "ابحث بالايميل...", "en": "Search by email..." },
  "الدور الوظيفي": { "ar": "الدور الوظيفي", "en": "Role Type" },
  "محرر (Editor)": { "ar": "محرر (Editor)", "en": "Editor" },
  "مشاهد (Viewer)": { "ar": "مشاهد (Viewer)", "en": "Viewer" },
  "مدير (Admin)": { "ar": "مدير (Admin)", "en": "Admin" },
  "حد التوكينز (0 = غير محدود)": { "ar": "حد التوكينز (0 = غير محدود)", "en": "Token Limit (0 = Unlimited)" },
  "صلاحيات الأدوات": { "ar": "صلاحيات الأدوات", "en": "Tool Permissions" },
  "الكل": { "ar": "الكل", "en": "All" },
  "لا شيء": { "ar": "لا شيء", "en": "None" },
  "حفظ التغييرات للصلاحيات": { "ar": "حفظ التغييرات للصلاحيات", "en": "Save Permissions" },
  "الرصيد الحالي": { "ar": "الرصيد الحالي", "en": "Current Balance" },
  "الباقة الحالية": { "ar": "الباقة الحالية", "en": "Current Plan" },
  "باقة برو (Pro)": { "ar": "باقة برو (Pro)", "en": "Pro Plan" },
  "/ شهر": { "ar": "/ شهر", "en": "/ month" },
  "ترقية إلى برو": { "ar": "ترقية إلى برو", "en": "Upgrade to Pro" },
  "باقة التيم (Team)": { "ar": "باقة التيم (Team)", "en": "Team Plan" },
  "ترقية إلى Team": { "ar": "ترقية إلى Team", "en": "Upgrade to Team" },
  "تفاصيل الحساب": { "ar": "تفاصيل الحساب", "en": "Account Details" },
  "Full Name": { "ar": "الاسم الكامل", "en": "Full Name" },
  "Email Address": { "ar": "عنوان البريد الإلكتروني", "en": "Email Address" },
  "Language": { "ar": "اللغة", "en": "Language" },
  "English": { "ar": "English", "en": "English" },
  "العربية": { "ar": "العربية", "en": "Arabic" },
  "Save Changes": { "ar": "حفظ التغييرات", "en": "Save Changes" },
  "توليد براند كيت جديد AI": { "ar": "توليد براند كيت جديد AI", "en": "Generate new Brand Kit AI" },
  "وصف البراند (مثال: براند ملابس شبابي باللون الأسود والأصفر..)": { "ar": "وصف البراند (مثال: براند ملابس شبابي باللون الأسود والأصفر..)", "en": "Brand description (e.g. youth clothing brand with black and yellow colors...)" },
  "توليد": { "ar": "توليد", "en": "Generate" },
  "نشط": { "ar": "نشط", "en": "Active" },
  "إضافة عضو جديد": { "ar": "إضافة عضو جديد", "en": "Add New Member" },
  "البريد الإلكتروني للعضو...": { "ar": "البريد الإلكتروني للعضو...", "en": "Member Email..." },
  "إضافة عضو": { "ar": "إضافة عضو", "en": "Add Member" },
  "الأعضاء الحاليين": { "ar": "الأعضاء الحاليين", "en": "Current Members" },
  "لا يوجد أعضاء في فريقك حتى الآن.": { "ar": "لا يوجد أعضاء في فريقك حتى الآن.", "en": "No members in your team yet." },
  "قم بإضافة أعضاء بالأعلى للاستفادة من خطة الوكالة.": { "ar": "قم بإضافة أعضاء بالأعلى للاستفادة من خطة الوكالة.", "en": "Add members above to utilize the agency plan." },
  "Photoshoot AI": { "ar": "الصور الاحترافية (Photoshoot)", "en": "Photoshoot AI" },
  "Creative Prompts": { "ar": "كريتيف GPT", "en": "Creative Prompts" },
  "Landing Pages": { "ar": "صفحات الهبوط Gemini", "en": "Landing Pages" },
  "بناء صفحة الهبوط": { "ar": "صفحات الهبوط HTML", "en": "Landing Page Builder" },
  "Creative Ads": { "ar": "إعلانات صور Gemini", "en": "Creative Ads" },
  "Video Scripts": { "ar": "اسكريبتات وفويس اوفر AI", "en": "Video Scripts" },
  "Winner Scripts": { "ar": "إعادة توليد الوينر أنجل", "en": "Winner Scripts" },
  "Script Extractor": { "ar": "دبلجة AI", "en": "Script Extractor" },
  "FB Ads Copies": { "ar": "نصوص إعلانات فيسبوك وتيك توك", "en": "FB Ads Copies" },
  "Funnel Copy": { "ar": "محتوى صفحة المنتج كفانل", "en": "Funnel Copy" },
  "Text on Visual": { "ar": "نصوص ثابتة على الفيديوهات", "en": "Text on Visual" },
  "Ad Downloader": { "ar": "محمل الإعلانات (Ad Downloader)", "en": "Ad Downloader" },
  "Profile updated successfully": { "ar": "تم تحديث الملف الشخصي بنجاح", "en": "Profile updated successfully" },
  "Error updating profile": {"ar": "خطأ في تحديث الملف الشخصي", "en": "Error updating profile"},
  "Brand Kit Generated successfully!": {"ar": "تم إنشاء الهوية البصرية بنجاح!", "en": "Brand Kit Generated successfully!"},
  "Error generating brand kit": {"ar": "خطأ في إنشاء الهوية البصرية", "en": "Error generating brand kit"},
  "Brand Kit Applied to Application": {"ar": "تم تطبيق الهوية البصرية على التطبيق", "en": "Brand Kit Applied to Application"},
  "Error applying brand kit": {"ar": "خطأ في تطبيق الهوية البصرية", "en": "Error applying brand kit"},
  "User updated successfully": {"ar": "تم تحديث المستخدم بنجاح", "en": "User updated successfully"},
  "Error updating user": {"ar": "خطأ في تحديث المستخدم", "en": "Error updating user"},
  "تم تحديث بيانات العضو": {"ar": "تم تحديث بيانات العضو", "en": "Member data updated"},
  "خطأ في التحديث": {"ar": "خطأ في التحديث", "en": "Update Error"},
  "تم حذف العضو بنجاح": {"ar": "تم حذف العضو بنجاح", "en": "Member removed successfully"},
  "خطأ في حذف العضو": {"ar": "خطأ في حذف العضو", "en": "Error removing member"},
  "لقد وصلت للحد الأقصى (عضوين)": {"ar": "لقد وصلت للحد الأقصى (عضوين)", "en": "You have reached the maximum limit (2 members)"},
  "لقد وصلت للحد الأقصى (7 أعضاء)": {"ar": "لقد وصلت للحد الأقصى (7 أعضاء)", "en": "You have reached the maximum limit (7 members)"},
  "لقد وصلت للحد الأقصى (2 أعضاء)": {"ar": "لقد وصلت للحد الأقصى (2 أعضاء)", "en": "You have reached the maximum limit (2 members)"},
  "تمت إضافة العضو بنجاح": {"ar": "تمت إضافة العضو بنجاح", "en": "Member added successfully"},
  "حدث خطأ أثناء الإضافة": {"ar": "حدث خطأ أثناء الإضافة", "en": "Error adding member"},
  "الرئيسية": { "ar": "الرئيسية", "en": "Home" },
  "تحليل المنتج": { "ar": "تحليل المنتج", "en": "Product Analysis" },
  "تغيير الخلفيات (Photoshoot)": { "ar": "تغيير الخلفيات (Photoshoot)", "en": "Background Change (Photoshoot)" },
  "صفحات الهبوط (Landing Pages)": { "ar": "صفحات الهبوط Gemini", "en": "Landing Pages" },
  "كرييتف وتصاميم (Ads)": { "ar": "إعلانات صور Gemini", "en": "Ads Creatives" },
  "كتابة سكربتات (Scripts)": { "ar": "اسكريبتات وفويس اوفر AI", "en": "Writing Scripts" },
  "إعلانات فيسبوك (Facebook Ads)": { "ar": "نصوص إعلانات فيسبوك وتيك توك", "en": "Facebook Ads" },
  "محتوى الفنل (Funnel Copy)": { "ar": "محتوى صفحة المنتج كفانل", "en": "Funnel Copy" },
  "تحليل المنافسين (Winner Angle)": { "ar": "إعادة توليد الوينر أنجل", "en": "Competitor Analysis (Winner Angle)" },
  "سكربتات الفيديو (Video Scenes)": { "ar": "اسكريبتات وفويس اوفر AI", "en": "Video Scripts (Scenes)" },
  "برومبتات إبداعية (Prompts)": { "ar": "كريتيف GPT", "en": "Creative Prompts" },
  "نصوص على الميديا (Text on Visual)": { "ar": "نصوص ثابتة على الفيديوهات", "en": "Text on Visual" },
  "الإنتاج البصري": {
    "ar": "الإنتاج البصري",
    "en": "Visual Production"
  },
  "توليد الصوت والسيناريو": {
    "ar": "توليد الصوت والسيناريو",
    "en": "Audio & Scripts"
  },
  "إعادة التوليد بصوت مختلف:": {
    "ar": "إعادة التوليد بصوت مختلف:",
    "en": "Regenerate with different voice:"
  },
  "إعادة التوليد": {
    "ar": "إعادة التوليد",
    "en": "Regenerate"
  },
  "توليد النصوص": {
    "ar": "توليد النصوص",
    "en": "Text Generation"
  },
  "أدوات مساعدة": {
    "ar": "أدوات مساعدة",
    "en": "Utilities"
  },
  "استخراج سكريبت من فيديو": {
    "ar": "استخراج سكريبت من فيديو",
    "en": "Extract Script from Video"
  },
  "استخراج الاسكريبت من اللينك": {
    "ar": "استخراج الاسكريبت من اللينك",
    "en": "Extract Script from Link"
  },
  "قسم استخراج النص من الروابط والملفات": {
    "ar": "قسم استخراج النص من الروابط والملفات",
    "en": "Extract Text from Links & Files"
  },
  "مسار العمل (Funnel)": {
    "ar": "مسار العمل (Funnel)",
    "en": "مسار العمل (Funnel)"
  },
  "1. جلسة التصوير": {
    "ar": "1. جلسة التصوير",
    "en": "1. جلسة التصوير"
  },
  "توليد صور احترافية للمنتج": {
    "ar": "توليد صور احترافية للمنتج",
    "en": "Generate professional product images"
  },
  "2. صفحة الهبوط": {
    "ar": "2. صفحات الهبوط Gemini",
    "en": "2. صفحات الهبوط"
  },
  "تصميم أقسام صفحة المبيعات": {
    "ar": "تصميم أقسام صفحة المبيعات",
    "en": "تصميم أقسام صفحة المبيعات"
  },
  "3. الكريتيفز الإعلانية": {
    "ar": "3. الكريتيفز الإعلانية",
    "en": "3. الكريتيفز الإعلانية"
  },
  "توليد 10 تصميمات إعلانية": {
    "ar": "توليد 10 تصميمات إعلانية",
    "en": "توليد 10 تصميمات إعلانية"
  },
  "4. سكريبتات الفيديو": {
    "ar": "4. اسكريبتات وفويس اوفر AI",
    "en": "4. اسكريبتات وفويس اوفر AI"
  },
  "كتابة سكريبتات وتوليد صوت": {
    "ar": "كتابة سكريبتات وتوليد صوت",
    "en": "Write scripts & generate voiceover"
  },
  "5. نصوص الإعلانات": {
    "ar": "5. نصوص إعلانات فيسبوك وتيك توك",
    "en": "5. نصوص الإعلانات"
  },
  "كتابة نصوص فيسبوك وتيك توك": {
    "ar": "كتابة نصوص فيسبوك وتيك توك",
    "en": "Facebook & TikTok Copy"
  },
  "6. هيكل صفحة الهبوط": {
    "ar": "6. محتوى صفحة المنتج كفانل",
    "en": "6. هيكل صفحة الهبوط"
  },
  "كتابة محتوى صفحة المبيعات": {
    "ar": "كتابة محتوى صفحة المبيعات",
    "en": "Sales Page Copywriting"
  },
  "7. مشاهد فيديو (Flow)": {
    "ar": "7. مشاهد فيديو (Flow)",
    "en": "7. مشاهد فيديو (Flow)"
  },
  "توليد مشاهد وأوامر لـ Veo 3": {
    "ar": "توليد مشاهد وأوامر لـ Veo 3",
    "en": "Generate scenes & prompts for Veo 3"
  },
  "8. إعادة توليد الانجل الوينر": {
    "ar": "8. إعادة توليد الوينر أنجل",
    "en": "8. إعادة توليد الانجل الوينر"
  },
  "استنساخ زاوية فيديو ناجح": {
    "ar": "استنساخ زاوية فيديو ناجح",
    "en": "Clone a successful video angle"
  },
  "9. أوامر توليد تصاميم الإعلانات": {
    "ar": "9. أوامر توليد تصاميم الإعلانات",
    "en": "9. أوامر توليد تصاميم الإعلانات"
  },
  "إنشاء Prompts قوية للديزاينات": {
    "ar": "إنشاء Prompts قوية للديزاينات",
    "en": "إنشاء Prompts قوية للديزاينات"
  },
  "سجل المحفوظات": {
    "ar": "سجل المحفوظات",
    "en": "History"
  },
  "مسح الكل": {
    "ar": "مسح الكل",
    "en": "Clear All"
  },
  "جميع الأدوات": {
    "ar": "جميع الأدوات",
    "en": "All Tools"
  },
  "اسكريبت وفويس": {
    "ar": "اسكريبت وفويس",
    "en": "Script & Voice"
  },
  "إعلانات منصات التواصل": {
    "ar": "إعلانات منصات التواصل",
    "en": "Social Media Ads"
  },
  "محتوى الفانل": {
    "ar": "محتوى الفانل",
    "en": "Funnel Copy"
  },
  "الزوايا الإعلانية": {
    "ar": "الزوايا الإعلانية",
    "en": "Ad Angles"
  },
  "صفحات الهبوط": {
    "ar": "صفحات الهبوط",
    "en": "Landing Pages"
  },
  
  "المفضلة": {
    "ar": "المفضلة",
    "en": "Favorites"
  },
  "متأكد؟": {
    "ar": "متأكد؟",
    "en": "Sure?"
  },
  "نعم": {
    "ar": "نعم",
    "en": "Yes"
  },
  
  "هل أنت متأكد من مسح جميع المحفوظات؟": {
    "ar": "هل أنت متأكد من مسح جميع المحفوظات؟",
    "en": "Are you sure you want to clear all history?"
  },
  "تم مسح جميع المحفوظات بنجاح": {
    "ar": "تم مسح جميع المحفوظات بنجاح",
    "en": "All history cleared successfully"
  },
  "حدث خطأ أثناء مسح المحفوظات": {
    "ar": "حدث خطأ أثناء مسح المحفوظات",
    "en": "Error occurred while clearing history"
  },
  "النصوص والمشاهد السابقة": {
    "ar": "النصوص والمشاهد السابقة",
    "en": "Previous text & scenes"
  },
  "تسجيل الدخول لحفظ المنتجات": {
    "ar": "تسجيل الدخول لحفظ المنتجات",
    "en": "Login to save products"
  },
  "تمت البرمجة بواسطة": {
    "ar": "تمت البرمجة بواسطة",
    "en": "Developed by"
  },
  "محمد العاشوري": {
    "ar": "محمد العاشوري",
    "en": "محمد العاشوري"
  },
  "جميع الحقوق محفوظة &copy;": {
    "ar": "جميع الحقوق محفوظة &copy;",
    "en": "All Rights Reserved &copy;"
  },
  "مولّد الإعلانات الذكي ✨": {
    "ar": "مولّد الإعلانات الذكي ✨",
    "en": "Smart Ad Generator ✨"
  },
  "خطوتك الأسرع لمضاعفة مبيعاتك بنقرة واحدة": {
    "ar": "خطوتك الأسرع لمضاعفة مبيعاتك بنقرة واحدة",
    "en": "Your fastest step to multiply sales with one click"
  },
  "تسجيل الدخول": {
    "ar": "تسجيل الدخول",
    "en": "Login"
  },
  "بيانات المنتج": {
    "ar": "بيانات المنتج",
    "en": "Product Data"
  },
  "استخراج من رابط (اختياري)": {
    "ar": "استخراج من رابط (اختياري)",
    "en": "Extract from Link (Optional)"
  },
  "سيقوم الذكاء الاصطناعي بجلب الوصف والصور تلقائياً من الرابط.": {
    "ar": "سيقوم الذكاء الاصطناعي بجلب الوصف والصور تلقائياً من الرابط.",
    "en": "AI will automatically fetch the description and images from the link."
  },
  "صور المنتج (اسحب وأفلت أو اضغط للرفع)": {
    "ar": "صور المنتج (اسحب وأفلت أو اضغط للرفع)",
    "en": "Product Images (Drag & drop or click to upload)"
  },
  "أو اضغط لاختيار الملفات": {
    "ar": "أو اضغط لاختيار الملفات",
    "en": "Or click to select files"
  },
  "وصف المنتج": {
    "ar": "وصف المنتج",
    "en": "Product Description"
  },
  "يمكنك كتابة أي أوامر أو تفاصيل إضافية للسكريبتات، أكواد، أو صور مولّدة براحتك كإضافة بعد وصف المنتج.": {
    "ar": "يمكنك كتابة أي أوامر أو تفاصيل إضافية للسكريبتات، أكواد، أو صور مولّدة براحتك كإضافة بعد وصف المنتج.",
    "en": "You can add any extra instructions, code, or details for the generated scripts and images after the product description."
  },
  "اللهجة": {
    "ar": "اللهجة",
    "en": "Dialect"
  },
  "المصرية (عامية)": {
    "ar": "المصرية (عامية)",
    "en": "Egyptian (Slang)"
  },
  "السعودية (عامية)": {
    "ar": "السعودية (عامية)",
    "en": "Saudi (Slang)"
  },
  "الإماراتية": {
    "ar": "الإماراتية",
    "en": "Emirati"
  },
  "الليبية": {
    "ar": "الليبية",
    "en": "Libyan"
  },
  "العراقية": {
    "ar": "العراقية",
    "en": "Iraqi"
  },
  "السورية": {
    "ar": "السورية",
    "en": "Syrian"
  },
  "الفلسطينية": {
    "ar": "الفلسطينية",
    "en": "Palestinian"
  },
  "الإنجليزية": {
    "ar": "الإنجليزية",
    "en": "English"
  },
  "العربية الفصحى": {
    "ar": "العربية الفصحى",
    "en": "Modern Standard Arabic (MSA)"
  },
  "نوع المشاهد": {
    "ar": "نوع المشاهد",
    "en": "Scene Type"
  },
  "5 مشاهد متتالية (إعلان كامل)": {
    "ar": "5 مشاهد متتالية (إعلان كامل)",
    "en": "5 Consecutive Scenes (Full Ad)"
  },
  "5 هوكات مختلفة (بدايات فقط)": {
    "ar": "5 هوكات مختلفة (بدايات فقط)",
    "en": "5 Different Hooks (Starts only)"
  },
  "الخط": {
    "ar": "الخط",
    "en": "Font"
  },
  "Cairo (عصري وجريء)": {
    "ar": "Cairo (عصري وجريء)",
    "en": "Cairo (عصري وجريء)"
  },
  "Tajawal (أنيق ورسمي)": {
    "ar": "Tajawal (أنيق ورسمي)",
    "en": "Tajawal (أنيق ورسمي)"
  },
  "Almarai (واضح ومقروء)": {
    "ar": "Almarai (واضح ومقروء)",
    "en": "Almarai (واضح ومقروء)"
  },
  "Readex Pro (تقني وحديث)": {
    "ar": "Readex Pro (تقني وحديث)",
    "en": "Readex Pro (تقني وحديث)"
  },
  "IBM Plex (احترافي)": {
    "ar": "IBM Plex (احترافي)",
    "en": "IBM Plex (احترافي)"
  },
  "لون الهوية (العناصر المميزة)": {
    "ar": "لون الهوية (العناصر المميزة)",
    "en": "Brand Color (Accent)"
  },
  "تصميم صفحة الهبوط والإعلانات": {
    "ar": "تصميم صفحة الهبوط والإعلانات",
    "en": "Landing Page & Ads Design Style"
  },
  "تكنولوجي حديث (Tech)": {
    "ar": "تكنولوجي حديث (Tech)",
    "en": "تكنولوجي حديث (Tech)"
  },
  "خلفيات داكنة، إضاءات نيون، عناصر عائمة (مناسب للإلكترونيات)": {
    "ar": "خلفيات داكنة، إضاءات نيون، عناصر عائمة (مناسب للإلكترونيات)",
    "en": "خلفيات داكنة، إضاءات نيون، عناصر عائمة (مناسب للإلكترونيات)"
  },
  "أسلوب حياة (Lifestyle)": {
    "ar": "أسلوب حياة (Lifestyle)",
    "en": "أسلوب حياة (Lifestyle)"
  },
  "تصميم نظيف، نصوص واضحة، التركيز على الاستخدام اليومي": {
    "ar": "تصميم نظيف، نصوص واضحة، التركيز على الاستخدام اليومي",
    "en": "تصميم نظيف، نصوص واضحة، التركيز على الاستخدام اليومي"
  },
  "بيع مباشر (Direct Response)": {
    "ar": "بيع مباشر (Direct Response)",
    "en": "بيع مباشر (Direct Response)"
  },
  "مقارنات واضحة، خطوات استخدام، تركيز على التقييمات والضمان": {
    "ar": "مقارنات واضحة، خطوات استخدام، تركيز على التقييمات والضمان",
    "en": "مقارنات واضحة، خطوات استخدام، تركيز على التقييمات والضمان"
  },
  "أنيق وبسيط (Minimal & Elegant)": {
    "ar": "أنيق وبسيط (Minimal & Elegant)",
    "en": "أنيق وبسيط (Minimal & Elegant)"
  },
  "خلفيات فاتحة، مساحات بيضاء، تصميم هادئ واحترافي": {
    "ar": "خلفيات فاتحة، مساحات بيضاء، تصميم هادئ واحترافي",
    "en": "خلفيات فاتحة، مساحات بيضاء، تصميم هادئ واحترافي"
  },
  "فخم وراقي (Luxury & Elegant)": {
    "ar": "فخم وراقي (Luxury & Elegant)",
    "en": "فخم وراقي (Luxury & Elegant)"
  },
  "ألوان دافئة، خطوط رفيعة، تصميم يعكس الجودة العالية": {
    "ar": "ألوان دافئة، خطوط رفيعة، تصميم يعكس الجودة العالية",
    "en": "ألوان دافئة، خطوط رفيعة، تصميم يعكس الجودة العالية"
  },
  "قوي وجريء (Bold & Dynamic)": {
    "ar": "قوي وجريء (Bold & Dynamic)",
    "en": "قوي وجريء (Bold & Dynamic)"
  },
  "تباين عالي، ألوان صارخة، تصميم يخطف الأنظار": {
    "ar": "تباين عالي، ألوان صارخة، تصميم يخطف الأنظار",
    "en": "تباين عالي، ألوان صارخة، تصميم يخطف الأنظار"
  },
  "بريميوم مخصص (Premium Custom)": {
    "ar": "بريميوم مخصص (Premium Custom)",
    "en": "بريميوم مخصص (Premium Custom)"
  },
  "تصميم احترافي مخصص حسب المنتج، خالي من العناصر النسائية، مع تركيز على الألوان والمجال": {
    "ar": "تصميم احترافي مخصص حسب المنتج، خالي من العناصر النسائية، مع تركيز على الألوان والمجال",
    "en": "تصميم احترافي مخصص حسب المنتج، خالي من العناصر النسائية، مع تركيز على الألوان والمجال"
  },
  "لون النص الأساسي": {
    "ar": "لون النص الأساسي",
    "en": "Primary Text Color"
  },
  "أبيض": {
    "ar": "أبيض",
    "en": "أبيض"
  },
  "أسود": {
    "ar": "أسود",
    "en": "أسود"
  },
  "رمادي داكن": {
    "ar": "رمادي داكن",
    "en": "رمادي داكن"
  },
  "لون الهوية": {
    "ar": "لون الهوية",
    "en": "لون الهوية"
  },
  "بنفسجي - وردي": {
    "ar": "بنفسجي - وردي",
    "en": "بنفسجي - وردي"
  },
  "سماوي - أزرق": {
    "ar": "سماوي - أزرق",
    "en": "سماوي - أزرق"
  },
  "أصفر - برتقالي": {
    "ar": "أصفر - برتقالي",
    "en": "أصفر - برتقالي"
  },
  "أخضر - فيروزي": {
    "ar": "أخضر - فيروزي",
    "en": "أخضر - فيروزي"
  },
  "وردي - أحمر": {
    "ar": "وردي - أحمر",
    "en": "وردي - أحمر"
  },
  "نيلي - بنفسجي": {
    "ar": "نيلي - بنفسجي",
    "en": "نيلي - بنفسجي"
  },
  "تأثير النص": {
    "ar": "تأثير النص",
    "en": "Text Effect"
  },
  "بدون تأثير": {
    "ar": "بدون تأثير",
    "en": "No Effect"
  },
  "ظل خفيف": {
    "ar": "ظل خفيف",
    "en": "Light Shadow"
  },
  "ظل قوي": {
    "ar": "ظل قوي",
    "en": "Strong Shadow"
  },
  "إطار أسود رفيع (Outline)": {
    "ar": "إطار أسود رفيع (Outline)",
    "en": "Thin Black Outline"
  },
  "إطار أبيض رفيع (Outline)": {
    "ar": "إطار أبيض رفيع (Outline)",
    "en": "Thin White Outline"
  },
  "إطار أسود سميك": {
    "ar": "إطار أسود سميك",
    "en": "Thick Black Outline"
  },
  "إطار أبيض سميك": {
    "ar": "إطار أبيض سميك",
    "en": "Thick White Outline"
  },
  "خلفية النصوص (البلوكات)": {
    "ar": "خلفية النصوص (البلوكات)",
    "en": "Text Background (Blocks)"
  },
  "داخل بلوكات (كما هو)": {
    "ar": "داخل بلوكات (كما هو)",
    "en": "Inside Blocks"
  },
  "بدون خلفية (نص حر)": {
    "ar": "بدون خلفية (نص حر)",
    "en": "No Background (Free Text)"
  },
  "مدة الفيديو": {
    "ar": "مدة الفيديو",
    "en": "Video Duration"
  },
  "عدد السكريبتات": {
    "ar": "عدد السكريبتات",
    "en": "Number of Scripts"
  },
  "أنواع السكريبتات (اختر": {
    "ar": "أنواع السكريبتات (اختر",
    "en": "أنواع السكريبتات (اختر"
  },
  "توليد خلفيات بالذكاء الاصطناعي (ميزة متقدمة)": {
    "ar": "توليد خلفيات بالذكاء الاصطناعي (ميزة متقدمة)",
    "en": "Generate AI Backgrounds (Advanced)"
  },
  "يضع المنتج في بيئات مختلفة. قد يستغرق وقتاً أطول ويتطلب باقة مدفوعة لتجنب حدود الاستخدام.": {
    "ar": "يضع المنتج في بيئات مختلفة. قد يستغرق وقتاً أطول ويتطلب باقة مدفوعة لتجنب حدود الاستخدام.",
    "en": "Places the product in different environments. May take longer and require a paid plan to avoid rate limits."
  },
  "عدد الأوامر/التصاميم": {
    "ar": "عدد الأوامر/التصاميم",
    "en": "Number of Prompts/Designs"
  },
  "نموذج الذكاء الاصطناعي": {
    "ar": "نموذج الذكاء الاصطناعي",
    "en": "AI Model"
  },
  "نمط التصاميم": {
    "ar": "نمط التصاميم",
    "en": "Designs Mode"
  },
  "أفكار متنوعة منفصلة": {
    "ar": "أفكار متنوعة (مستقلة)",
    "en": "Standalone Mixed Ideas"
  },
  "كاروسيل متصل (سلايدر)": {
    "ar": "كاروسيل متصل (سلايدر)",
    "en": "Continuous Carousel"
  },
  "صفحة هبوط متتابعة (Landing Page)": {
    "ar": "صفحة هبوط متتابعة (Landing Page)",
    "en": "Sequential Landing Page"
  },
  "النموذج المجاني (سريع)": {
    "ar": "النموذج المجاني (سريع)",
    "en": "Free Model (Fast)"
  },
  "النموذج المتقدم (Pro)": {
    "ar": "النموذج المتقدم (Pro)",
    "en": "Pro Model (Advanced)"
  },
  "جاري الإنشاء...": {
    "ar": "جاري الإنشاء...",
    "en": "Generating..."
  },
  "جاري كتابة السكريبت...": {
    "ar": "جاري كتابة السكريبت...",
    "en": "Writing Script..."
  },
  "جاري كتابة الإعلانات...": {
    "ar": "جاري كتابة الإعلانات...",
    "en": "Writing Ads..."
  },
  "جاري كتابة الاستراكشر...": {
    "ar": "جاري كتابة الاستراكشر...",
    "en": "Writing Structure..."
  },
  "جاري توليد المشاهد...": {
    "ar": "جاري توليد المشاهد...",
    "en": "Generating Scenes..."
  },
  "جاري التوليد...": {
    "ar": "جاري التوليد...",
    "en": "Generating..."
  },
  "جاري التصوير...": {
    "ar": "جاري التصوير...",
    "en": "Photoshooting..."
  },
  "حالة تقدم صفحة الهبوط": {
    "ar": "حالة تقدم صفحة الهبوط",
    "en": "Landing Page Progress"
  },
  "حالة تقدم الإعلانات": {
    "ar": "حالة تقدم الإعلانات",
    "en": "Ads Progress"
  },
  "حالة تقدم جلسة التصوير": {
    "ar": "حالة تقدم جلسة التصوير",
    "en": "Photoshoot Progress"
  },
  "الصور الناتجة (صفحة الهبوط)": {
    "ar": "الصور الناتجة (صفحة الهبوط)",
    "en": "Generated Images (Landing Page)"
  },
  "تحميل الكل": {
    "ar": "تحميل الكل",
    "en": "Download All"
  },
  "الصور ستظهر هنا بعد الإنشاء": {
    "ar": "الصور ستظهر هنا بعد الإنشاء",
    "en": "Images will appear here after generation"
  },
  "جاري تصميم الصورة": {
    "ar": "جاري تصميم الصورة",
    "en": "جاري تصميم الصورة"
  },
  "الكريتيفز الإعلانية (AI)": {
    "ar": "الكريتيفز الإعلانية (AI)",
    "en": "Ad Creatives (AI)"
  },
  "الكريتيفز الإعلانية ستظهر هنا بعد الإنشاء": {
    "ar": "الكريتيفز الإعلانية ستظهر هنا بعد الإنشاء",
    "en": "Ad creatives will appear here after generation"
  },
  "جاري تصميم الإعلان": {
    "ar": "جاري تصميم الإعلان",
    "en": "جاري تصميم الإعلان"
  },
  "سكريبتات الفيديو (AI)": {
    "ar": "اسكريبتات وفويس اوفر AI",
    "en": "Video Scripts (AI)"
  },
  "تحميل WAV": {
    "ar": "تحميل WAV",
    "en": "Download WAV"
  },
  "تحميل MP3": {
    "ar": "تحميل MP3",
    "en": "Download MP3"
  },
  "توليد الصوت للجميع": {
    "ar": "توليد الصوت للجميع",
    "en": "Generate Voiceover for All"
  },
  "سكريبتات الفيديو ستظهر هنا بعد الإنشاء": {
    "ar": "اسكريبتات وفويس اوفر AI ستظهر هنا بعد الإنشاء",
    "en": "Scripts will appear here after generation"
  },
  "جاري كتابة السكريبتات...": {
    "ar": "جاري كتابة الاسكريبتات...",
    "en": "جاري كتابة السكريبتات..."
  },
  "نصنع هوك قوي يجذب الانتباه": {
    "ar": "نصنع هوك قوي يجذب الانتباه",
    "en": "Crafting a strong hook to grab attention"
  },
  "التعليق الصوتي (AI)": {
    "ar": "التعليق الصوتي (AI)",
    "en": "Voiceover (AI)"
  },
  "متصفحك لا يدعم تشغيل الصوت.": {
    "ar": "متصفحك لا يدعم تشغيل الصوت.",
    "en": "Your browser does not support audio playback."
  },
  "نسخ إعلانات فيسبوك (AI)": {
    "ar": "نسخ إعلانات فيسبوك (AI)",
    "en": "Facebook Ad Copy (AI)"
  },
  "نسخ إعلانات فيسبوك ستظهر هنا بعد الإنشاء": {
    "ar": "نسخ إعلانات فيسبوك ستظهر هنا بعد الإنشاء",
    "en": "Facebook ad copy will appear here after generation"
  },
  "نصنع 5 أنواع مختلفة من الإعلانات": {
    "ar": "نصنع 5 أنواع مختلفة من الإعلانات",
    "en": "Crafting 5 different types of ads"
  },
  "عناوين تيك توك (TikTok Headlines)": {
    "ar": "عناوين تيك توك (TikTok Headlines)",
    "en": "TikTok Headlines"
  },
  "نسخ إعلانات فيسبوك": {
    "ar": "نسخ إعلانات فيسبوك",
    "en": "Facebook Ad Copy"
  },
  "Hook (الخطاف):": {
    "ar": "Hook (الخطاف):",
    "en": "Hook:"
  },
  "Body (المحتوى):": {
    "ar": "Body (المحتوى):",
    "en": "Body:"
  },
  "CTA (الدعوة لاتخاذ إجراء):": {
    "ar": "CTA (الدعوة لاتخاذ إجراء):",
    "en": "CTA:"
  },
  "استراكشر لاند بيدج (AI)": {
    "ar": "استراكشر لاند بيدج (AI)",
    "en": "Landing Page Structure (AI)"
  },
  "استراكشر اللاند بيدج سيظهر هنا بعد الإنشاء": {
    "ar": "استراكشر اللاند بيدج سيظهر هنا بعد الإنشاء",
    "en": "Landing page structure will appear here after generation"
  },
  "النص الكامل": {
    "ar": "النص الكامل",
    "en": "Full Text"
  },
  "مشاهد فيديو (Flow / Veo 3)": {
    "ar": "مشاهد فيديو (Flow / Veo 3)",
    "en": "Video Scenes (Flow / Veo 3)"
  },
  "المشاهد والأوامر ستظهر هنا بعد الإنشاء": {
    "ar": "المشاهد والأوامر ستظهر هنا بعد الإنشاء",
    "en": "Scenes and prompts will appear here after generation"
  },
  "Visual Prompt (لبرنامج Flow):": {
    "ar": "Visual Prompt (لبرنامج Flow):",
    "en": "Visual Prompt (for Flow):"
  },
  "نسخ": {
    "ar": "نسخ",
    "en": "Copy"
  },
  "السكريبت (التعليق الصوتي):": {
    "ar": "السكريبت (التعليق الصوتي):",
    "en": "Script (Voiceover):"
  },
  "إعادة توليد الانجل الوينر": {
    "ar": "إعادة توليد الانجل الوينر",
    "en": "Regenerate Winner Angle"
  },
  "نسخ كل المحتوى": {
    "ar": "نسخ كل المحتوى",
    "en": "Copy All Content"
  },
  "ارفع فيديو الانجل الوينر (الحد الأقصى 20 ميجابايت)": {
    "ar": "ارفع فيديو الانجل الوينر (الحد الأقصى 20 ميجابايت)",
    "en": "Upload Winner Angle Video (Max 20MB)"
  },
  "اسحب وأفلت الفيديو هنا أو اضغط للاختيار": {
    "ar": "اسحب وأفلت الفيديو هنا أو اضغط للاختيار",
    "en": "Drag & drop video here or click to select"
  },
  "يدعم MP4, MOV, WEBM (حتى 20MB)": {
    "ar": "يدعم MP4, MOV, WEBM (حتى 20MB)",
    "en": "Supports MP4, MOV, WEBM (Up to 20MB)"
  },
  "سكريبت الفيديو الأصلي (قابل للتعديل)": {
    "ar": "سكريبت الفيديو الأصلي (قابل للتعديل)",
    "en": "Original Video Script (Editable)"
  },
  "جاري الاستخراج...": {
    "ar": "جاري الاستخراج...",
    "en": "Extracting..."
  },
  "استخراج السكريبت": {
    "ar": "استخراج السكريبت",
    "en": "Extract Script"
  },
  "قم برفع الفيديو واستخراج السكريبت لتوليد سكريبتات جديدة": {
    "ar": "قم برفع الفيديو واستخراج السكريبت لتوليد اسكريبتات جديدة",
    "en": "Upload the video and extract the script to generate new variations"
  },
  "جاري تحليل الفيديو وتوليد السكريبتات...": {
    "ar": "جاري تحليل الفيديو وتوليد الاسكريبتات...",
    "en": "Analyzing video and generating scripts..."
  },
  "أوامر توليد تصاميم الإعلانات (Creative Prompts)": {
    "ar": "أوامر توليد تصاميم الإعلانات (Creative Prompts)",
    "en": "Creative Prompts"
  },
  "قم بإدخال وصف المنتج لتوليد ديزاينات إعلانية قوية ومفصلة": {
    "ar": "قم بإدخال وصف المنتج لتوليد ديزاينات إعلانية قوية ومفصلة",
    "en": "Enter product description to generate strong and detailed ad designs"
  },
  "جاري وضع تصور شامل للديزاينات المبيعية وحساب أبعادها...": {
    "ar": "جاري وضع تصور شامل للديزاينات المبيعية وحساب أبعادها...",
    "en": "Conceptualizing sales designs and calculating dimensions..."
  },
  "الديزاين #": {
    "ar": "الديزاين #",
    "en": "الديزاين #"
  },
  "الفكرة والزاوية البيعية": {
    "ar": "الفكرة والزاوية البيعية",
    "en": "Sales Angle & Idea"
  },
  "الاستايل البصري والألوان": {
    "ar": "الاستايل البصري والألوان",
    "en": "Visual Style & Colors"
  },
  "النص التسويقي (Text Overlay)": {
    "ar": "النص التسويقي (Text Overlay)",
    "en": "Marketing Text (Text Overlay)"
  },
  "تفاصيل التصميم (Layout Breakdown)": {
    "ar": "تفاصيل التصميم (Layout Breakdown)",
    "en": "Layout Breakdown"
  },
  "الخلفية:": {
    "ar": "الخلفية:",
    "en": "Background:"
  },
  "موضع المنتج (Product Placement):": {
    "ar": "موضع المنتج (Product Placement):",
    "en": "Product Placement:"
  },
  "عناصر إضافية على الديزاين:": {
    "ar": "عناصر إضافية على الديزاين:",
    "en": "Additional Elements on Design:"
  },
  "أمر توليد التصميم للذكاء الاصطناعي (AI Prompt)": {
    "ar": "أمر توليد التصميم للذكاء الاصطناعي (AI Prompt)",
    "en": "AI Prompt"
  },
  "انسخ الأمر (Prompt)": {
    "ar": "انسخ الأمر (Prompt)",
    "en": "Copy Prompt"
  },
  "يمكنك استخدام هذا الأمر الشامل في نماذج توليد الصور (مثل Midjourney أو DALL-E) لتوليد التصميم كاملاً بكل تفاصيله.": {
    "ar": "يمكنك استخدام هذا الأمر الشامل في نماذج توليد الصور (مثل Midjourney أو DALL-E) لتوليد التصميم كاملاً بكل تفاصيله.",
    "en": "You can use this comprehensive prompt in image models (like Midjourney or DALL-E)."
  },
  "يرجى تسجيل الدخول لعرض سجل المحفوظات": {
    "ar": "يرجى تسجيل الدخول لعرض سجل المحفوظات",
    "en": "Please login to view history"
  },
  "جاري تحميل السجل...": {
    "ar": "جاري تحميل السجل...",
    "en": "Loading history..."
  },
  "لا يوجد سجل محفوظات حتى الآن": {
    "ar": "لا يوجد سجل محفوظات حتى الآن",
    "en": "No history yet"
  },
  "وصف المنتج:": {
    "ar": "وصف المنتج:",
    "en": "Product Description:"
  },
  "تصميم": {
    "ar": "تصميم",
    "en": "Design"
  },
  "الفكرة البيعية:": {
    "ar": "الفكرة البيعية:",
    "en": "Sales Idea:"
  },
  "الاستايل البصري:": {
    "ar": "الاستايل البصري:",
    "en": "Visual Style:"
  },
  "النص التسويقي": {
    "ar": "النص التسويقي",
    "en": "Marketing Text"
  },
  "تفاصيل التصميم": {
    "ar": "تفاصيل التصميم",
    "en": "Design Details"
  },
  "المنتج:": {
    "ar": "المنتج:",
    "en": "Product:"
  },
  "أمر توليد التصميم الشامل (AI Prompt):": {
    "ar": "أمر توليد التصميم الشامل (AI Prompt):",
    "en": "أمر توليد التصميم الشامل (AI Prompt):"
  },
  "مشاهد المنتج (AI)": {
    "ar": "مشاهد المنتج (AI)",
    "en": "Product Scenes (AI)"
  },
  "جاري النقل...": {
    "ar": "جاري النقل...",
    "en": "Transferring..."
  },
  "استخدام": {
    "ar": "استخدام",
    "en": "Use"
  },
  "صور في صفحة الهبوط": {
    "ar": "صور في صفحة الهبوط",
    "en": "images in landing page"
  },
  "مشاهد المنتج ستظهر هنا بعد الإنشاء": {
    "ar": "مشاهد المنتج ستظهر هنا بعد الإنشاء",
    "en": "Product scenes will appear here after generation"
  },
  "جاري تصوير المشهد": {
    "ar": "جاري تصوير المشهد",
    "en": "Shooting scene"
  },
  "تأكيد تغيير التصميم": {
    "ar": "تأكيد تغيير التصميم",
    "en": "Confirm Design Change"
  },
  "تغيير نمط التصميم قد يؤدي إلى إعادة تعيين بعض التخصيصات الحالية (مثل الألوان أو الخطوط) لتتناسب مع النمط الجديد. هل أنت متأكد من رغبتك في المتابعة؟": {
    "ar": "تغيير نمط التصميم قد يؤدي إلى إعادة تعيين بعض التخصيصات الحالية (مثل الألوان أو الخطوط) لتتناسب مع النمط الجديد. هل أنت متأكد من رغبتك في المتابعة؟",
    "en": "Changing the design style may reset some current customizations (like colors or fonts). Are you sure you want to proceed?"
  },
  
  "تأكيد التغيير": {
    "ar": "تأكيد التغيير",
    "en": "Confirm Change"
  },
  "تسجيل الخروج": {
    "ar": "تسجيل الخروج",
    "en": "Logout"
  },
  "Privacy Policy": {
    "ar": "سياسة الخصوصية",
    "en": "Privacy Policy"
  },
  "شروط الخدمة": {
    "ar": "شروط الخدمة",
    "en": "Terms of Service"
  },
  "Terms of Service": {
    "ar": "شروط الخدمة",
    "en": "Terms of Service"
  },
  "رابط صفحة المنتج...": {
    "ar": "رابط صفحة المنتج...",
    "en": "Product page URL..."
  },
  "اكتب وصفاً تفصيلياً للمنتج، مميزاته، ولمن يصلح...": {
    "ar": "اكتب وصفاً تفصيلياً للمنتج، مميزاته، ولمن يصلح...",
    "en": "Write a detailed description of the product, its features, and target audience..."
  },
  "اختر لون مخصص": {
    "ar": "اختر لون مخصص",
    "en": "Select Custom Color"
  },
  "تدرجات لونية (ميكسات)": {
    "ar": "تدرجات لونية (ميكسات)",
    "en": "Color Gradients (Mixes)"
  },
  "إيقاف الإنشاء": {
    "ar": "إيقاف الإنشاء",
    "en": "Stop Generation"
  },
  "سيظهر السكريبت المستخرج هنا، ويمكنك تعديله قبل التوليد...": {
    "ar": "سيظهر السكريبت المستخرج هنا، ويمكنك تعديله قبل التوليد...",
    "en": "Extracted script will appear here, and you can edit it before generation..."
  },
  "حذف من السجل": {
    "ar": "حذف من السجل",
    "en": "Delete from history"
  },
  "UGC (محتوى عفوي وتجربة مستخدم)": {
    "ar": "UGC (محتوى عفوي وتجربة مستخدم)",
    "en": "UGC (User Generated Content)"
  },
  "Direct Response (استجابة مباشرة وعرض قوي)": {
    "ar": "Direct Response (استجابة مباشرة وعرض قوي)",
    "en": "Direct Response"
  },
  "Storytelling (قصة قصيرة تجذب الانتباه)": {
    "ar": "Storytelling (قصة قصيرة تجذب الانتباه)",
    "en": "Storytelling"
  },
  "Problem/Solution (عرض المشكلة وتقديم المنتج كحل)": {
    "ar": "Problem/Solution (عرض المشكلة وتقديم المنتج كحل)",
    "en": "Problem/Solution"
  },
  "Educational/How-to (تعليمي / كيف تستخدم المنتج)": {
    "ar": "Educational/How-to (تعليمي / كيف تستخدم المنتج)",
    "en": "Educational/How-to"
  },
  "Testimonial/Review (مراجعة وتقييم للمنتج)": {
    "ar": "Testimonial/Review (مراجعة وتقييم للمنتج)",
    "en": "Testimonial/Review"
  },
  "Unboxing (فتح الصندوق واستعراض المحتويات)": {
    "ar": "Unboxing (فتح الصندوق واستعراض المحتويات)",
    "en": "Unboxing"
  },
  "Behind the Scenes (كواليس التصنيع أو التجهيز)": {
    "ar": "Behind the Scenes (كواليس التصنيع أو التجهيز)",
    "en": "Behind the Scenes"
  },
  "Humorous/Comedy (كوميدي وطريف)": {
    "ar": "Humorous/Comedy (كوميدي وطريف)",
    "en": "Humorous/Comedy"
  },
  "Fear of Missing Out - FOMO (خلق شعور بالاستعجال والندرة)": {
    "ar": "Fear of Missing Out - FOMO (خلق شعور بالاستعجال والندرة)",
    "en": "Fear of Missing Out (FOMO)"
  },
  "فشل تسجيل الدخول:": {
    "ar": "فشل تسجيل الدخول:",
    "en": "Login Failed:"
  },
  "هل ترغب بإضافة قسم للتقييمات والآراء (Reviews)؟ (نعم/لا)": {
    "ar": "هل ترغب بإضافة قسم للتقييمات والآراء (Reviews)؟ (نعم/لا)",
    "en": "Would you like to add a Reviews section? (Yes/No)"
  },
  "إذا اخترت إضافة التقييمات، يرجى كتابة التقييمات هنا (أو تخطى ذلك ليتم توليدها تلقائياً).": {
    "ar": "إذا اخترت إضافة التقييمات، يرجى كتابة التقييمات هنا (أو تخطى ذلك ليتم توليدها تلقائياً).",
    "en": "If yes, please write the reviews here (or skip to auto-generate)."
  },
  "هل تود بناء صفحة الهبوط بنموذج مُعلم تقليدي (أساسي)، أم نموذج مُعلم (كاجوال)، أم بنموذج حُر يعتمد على الذكاء الاصطناعي (حر)، أم بنموذج حر احترافي صارم (Anti AI Slop)؟ (أجب بـ: أساسي / كاجوال / حر / Anti AI Slop)": {
    "ar": "هل تود بناء صفحة الهبوط بنموذج مُعلم تقليدي (أساسي)، أم نموذج مُعلم (كاجوال)، أم بنموذج حُر يعتمد على الذكاء الاصطناعي (حر)، أم بنموذج حر احترافي صارم (Anti AI Slop)؟ (أجب بـ: أساسي / كاجوال / حر / Anti AI Slop)",
    "en": "Would you like a traditional (Basic), casual (Casual), or Free model for layout creativity? (Answer: Basic / Casual / Free)"
  },
  "أي نموذج ذكاء اصطناعي تفضل استخدامه للتوليد؟ (Flash / Pro). الفلاش أسرع وأرخص، والبرو أدق وأقوى.": {
    "ar": "أي نموذج ذكاء اصطناعي تفضل استخدامه للتوليد؟ (Flash / Pro). الفلاش أسرع وأرخص، والبرو أدق وأقوى.",
    "en": "Which AI model do you prefer? (Flash / Pro). Flash is faster and cheaper, Pro is more accurate and powerful."
  },
  "صائد المنتجات والإعلانات": {
    "ar": "صائد المنتجات والإعلانات",
    "en": "Product & Ad Spy"
  },
  "ابحث عن إعلانات وفيديوهات منتجك في كل المنصات بدقة واحترافية": {
    "ar": "ابحث عن إعلانات وفيديوهات منتجك في كل المنصات بدقة واحترافية",
    "en": "Search for your product ads and videos across all platforms precisely"
  },
  "البحث عن الإعلانات": {
    "ar": "البحث عن الإعلانات",
    "en": "Ad Search"
  },
  "صائد المنتجات": {
    "ar": "صائد المنتجات",
    "en": "Product Spy"
  },
  "اسم المنتج أو وصفه": {
    "ar": "اسم المنتج أو وصفه",
    "en": "Product Name or Description"
  },
  "مثال: مكنسة كهربائية لاسلكية قابلة للطي": {
    "ar": "مثال: مكنسة كهربائية لاسلكية قابلة للطي",
    "en": "e.g., Foldable cordless vacuum cleaner"
  },
  "صورة المنتج (اختياري للبحث بالذكاء الاصطناعي)": {
    "ar": "صورة المنتج (اختياري للبحث بالذكاء الاصطناعي)",
    "en": "Product Image (Optional for AI Search)"
  },
  "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت": {
    "ar": "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت",
    "en": "Image size must not exceed 5MB"
  },
  "اضغط لرفع صورة": {
    "ar": "اضغط لرفع صورة",
    "en": "Click to upload image"
  },
  "PNG, JPG حتى 5 ميجا": {
    "ar": "PNG, JPG حتى 5 ميجا",
    "en": "PNG, JPG up to 5MB"
  },
  "يرجى إدخال اسم المنتج أو رفع صورة": {
    "ar": "يرجى إدخال اسم المنتج أو رفع صورة",
    "en": "Please enter a product name or upload an image"
  },
  "جاري تحليل المنتج...": {
    "ar": "جاري تحليل المنتج...",
    "en": "Analyzing product..."
  },
  "إنشاء خطة البحث والروابط": {
    "ar": "إنشاء خطة البحث والروابط",
    "en": "Generate Search Plan & Links"
  },
  "منصة البحث السريع (ضغطة واحدة)": {
    "ar": "منصة البحث السريع (ضغطة واحدة)",
    "en": "Quick Search Hub (1-Click)"
  },
  "البحث عن:": {
    "ar": "البحث عن:",
    "en": "Search for:"
  },
  "البحث المتقدم بالصور (Google Lens)": {
    "ar": "البحث المتقدم بالصور (Google Lens)",
    "en": "Advanced Image Search (Google Lens)"
  },
  "للبحث بدقة 100% عن نفس المنتج في المتاجر الأخرى أو الحصول على فيديوهاته، يمكنك استخدام Google Lens مباشرة:": {
    "ar": "للبحث بدقة 100% عن نفس المنتج في المتاجر الأخرى أو الحصول على فيديوهاته، يمكنك استخدام Google Lens مباشرة:",
    "en": "For 100% accurate search to find the exact product in other stores or get its videos, use Google Lens directly:"
  },
  "افتح Google Lens": {
    "ar": "افتح Google Lens",
    "en": "Open Google Lens"
  },
  "الهاشتاجات المقترحة للبحث": {
    "ar": "الهاشتاجات المقترحة للبحث",
    "en": "Suggested Hashtags for Search"
  },
  "روابط فيديوهات وإعلانات مقترحة (بواسطة AI)": {
    "ar": "روابط فيديوهات وإعلانات مقترحة (بواسطة AI)",
    "en": "Suggested Video & Ad Links (by AI)"
  },
  "نسبة المطابقة:": {
    "ar": "نسبة المطابقة:",
    "en": "Relevance:"
  },
  "أهلاً بك! لإنشاء صفحة الهبوط، يرجى تزويدي بروابط الصور (أو اتركها فارغة لتخطيها).": {
    "ar": "أهلاً بك! لإنشاء صفحة الهبوط، يرجى تزويدي بروابط الصور (أو اتركها فارغة لتخطيها).",
    "en": "Welcome! To create the landing page, please provide image URLs (or leave blank to skip)."
  },
  "ممتاز! هل لديك روابط لأي فيديوهات ترغب بإضافتها؟": {
    "ar": "ممتاز! هل لديك روابط لأي فيديوهات ترغب بإضافتها؟",
    "en": "Great! Do you have any video URLs to add?"
  },
  "يرجى كتابة وصف مفصل للمنتج وما يميزه لكي أتمكن من كتابة المحتوى الإقناعي.": {
    "ar": "يرجى كتابة وصف مفصل للمنتج وما يميزه لكي أتمكن من كتابة المحتوى الإقناعي.",
    "en": "Please write a detailed product description so I can write persuasive copy."
  },
  "ما هي اللغة أو اللهجة التي تفضل كتابة الصفحة بها؟ (مثال: فصحى، سعودية بيضاء، مصرية، الخ)": {
    "ar": "ما هي اللغة أو اللهجة التي تفضل كتابة الصفحة بها؟ (مثال: فصحى، سعودية بيضاء، مصرية، الخ)",
    "en": "What language/dialect do you prefer? (e.g. Modern Standard, Egyptian, Saudi...)"
  },
  "ما هي الألوان التي تفضل استخدامها في الصفحة؟ (مثال: أزرق مع برتقالي، غامق، فاتح)": {
    "ar": "ما هي الألوان التي تفضل استخدامها في الصفحة؟ (مثال: أزرق مع برتقالي، غامق، فاتح)",
    "en": "What colors do you prefer? (e.g. blue & orange, dark, light)"
  },
  "كم عدد الأقسام التي تريدها في الصفحة؟ وما هي؟ (مثال: الهيدر، المميزات، الآراء...)": {
    "ar": "كم عدد الأقسام التي تريدها في الصفحة؟ وما هي؟ (مثال: الهيدر، المميزات، الآراء...)",
    "en": "How many sections do you want and what are they? (e.g. Header, Features, Reviews...)"
  },
  "كم عدد الأقسام التي تريدها في الصفحة؟ وما هي؟ حدد من أنواع الأقسام العشرة التالية:\n1. Hero Section\n2. Problem Section\n3. Solution Section\n4. Benefits Section\n5. Features Section\n6. Social Proof Section\n7. Offer Section\n8. FAQ Section\n9. Trust Section\n10. Call-to-Action (CTA) Section": {
    "ar": "كم عدد الأقسام التي تريدها في الصفحة؟ وما هي؟ حدد من أنواع الأقسام العشرة التالية:\n1. Hero Section\n2. Problem Section\n3. Solution Section\n4. Benefits Section\n5. Features Section\n6. Social Proof Section\n7. Offer Section\n8. FAQ Section\n9. Trust Section\n10. Call-to-Action (CTA) Section",
    "en": "How many sections do you want in the page and which ones? Please select from the following 10 section types:\n1. Hero Section\n2. Problem Section\n3. Solution Section\n4. Benefits Section\n5. Features Section\n6. Social Proof Section\n7. Offer Section\n8. FAQ Section\n9. Trust Section\n10. Call-to-Action (CTA) Section"
  },
  "هل تفضل أن تكون الكوبي (النصوص) طويلة جداً ومقنعة أم متوسطة ومباشرة؟": {
    "ar": "هل تفضل أن تكون الكوبي (النصوص) طويلة جداً ومقنعة أم متوسطة ومباشرة؟",
    "en": "Do you prefer the copy to be long & persuasive or medium & direct?"
  },
  "هل تريد إضافة أنيميشن لأزرار الشراء (CTA) لجذب الانتباه؟ (نعم/لا)": {
    "ar": "هل تريد إضافة أنيميشن لأزرار الشراء (CTA) لجذب الانتباه؟ (نعم/لا)",
    "en": "Would you like to add CTA animations to grab attention? (Yes/No)"
  },
  "تم رصد هوية براند نشطة": {
    "ar": "تم رصد هوية براند نشطة",
    "en": "Active brand kit detected"
  },
  "هل تود تطبيقها على صفحة الهبوط؟ (نعم/لا)": {
    "ar": "هل تود تطبيقها على صفحة الهبوط؟ (نعم/لا)",
    "en": "Would you like to apply it to the landing page? (Yes/No)"
  },
  "جاري تطبيق تعديلاتك على الصفحة، يرجى الانتظار...": {
    "ar": "جاري تطبيق تعديلاتك على الصفحة، يرجى الانتظار...",
    "en": "Applying your edits to the page, please wait..."
  },
  "شكراً لك! جاري بناء وتكويد صفحة الهبوط باحترافية عالية، يرجى الانتظار قليلاً...": {
    "ar": "شكراً لك! جاري بناء وتكويد صفحة الهبوط باحترافية عالية، يرجى الانتظار قليلاً...",
    "en": "Thank you! Building and coding the landing page professionally, please wait..."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string) => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
