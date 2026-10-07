import React, { useState, useEffect } from 'react';
import { Copy, Link as LinkIcon, Check } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function UtmBuilder() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [campaignSource, setCampaignSource] = useState('snapchat');
  const [campaignMedium, setCampaignMedium] = useState('');
  const [campaignName, setCampaignName] = useState('__CAMPAIGN_NAME__');
  const [campaignId, setCampaignId] = useState('');
  const [campaignTerm, setCampaignTerm] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!websiteUrl) {
      setGeneratedUrl('');
      return;
    }
    
    try {
      // Ensure the URL has a protocol
      let base = websiteUrl.trim();
      if (!base.startsWith('http://') && !base.startsWith('https://')) {
        base = 'https://' + base;
      }
      
      const url = new URL(base);
      
      if (campaignSource) url.searchParams.set('utm_source', campaignSource);
      if (campaignMedium) url.searchParams.set('utm_medium', campaignMedium);
      if (campaignId) url.searchParams.set('utm_id', campaignId);
      if (campaignName) url.searchParams.set('utm_campaign', campaignName);
      if (campaignTerm) url.searchParams.set('utm_term', campaignTerm);
      if (campaignContent) url.searchParams.set('utm_content', campaignContent);
      
      setGeneratedUrl(url.toString());
    } catch (e) {
      // Fallback
      let fallbackUrl = websiteUrl.trim();
      const params = new URLSearchParams();
      if (campaignSource) params.set('utm_source', campaignSource);
      if (campaignMedium) params.set('utm_medium', campaignMedium);
      if (campaignId) params.set('utm_id', campaignId);
      if (campaignName) params.set('utm_campaign', campaignName);
      if (campaignTerm) params.set('utm_term', campaignTerm);
      if (campaignContent) params.set('utm_content', campaignContent);
      
      const queryString = params.toString();
      if (queryString) {
        fallbackUrl += (fallbackUrl.includes('?') ? '&' : '?') + queryString;
      }
      setGeneratedUrl(fallbackUrl);
    }
  }, [websiteUrl, campaignSource, campaignMedium, campaignName, campaignId, campaignTerm, campaignContent]);

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-fuchsia-100 flex items-center justify-center dark:bg-fuchsia-900/30">
          <LinkIcon className="w-6 h-6 text-[#F0B21B] dark:text-[#F0B21B]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">UTM Builder</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("قم ببناء روابط تتبع الحملات الإعلانية باستخدام UTM")}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://www.yourstore.com/products/item"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B]/50 text-left"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Campaign Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={campaignSource}
                onChange={(e) => setCampaignSource(e.target.value)}
                placeholder="snapchat, tiktok, facebook, google"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B]/50 text-left"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Campaign Medium
              </label>
              <input
                type="text"
                value={campaignMedium}
                onChange={(e) => setCampaignMedium(e.target.value)}
                placeholder="paid, cpc, email"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B]/50 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="__CAMPAIGN_NAME__"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B]/50 text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Campaign ID
              </label>
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="__CAMPAIGN_ID__"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B]/50 text-left"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Campaign Term
              </label>
              <input
                type="text"
                value={campaignTerm}
                onChange={(e) => setCampaignTerm(e.target.value)}
                placeholder="identify the paid keywords"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B]/50 text-left"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Campaign Content
              </label>
              <input
                type="text"
                value={campaignContent}
                onChange={(e) => setCampaignContent(e.target.value)}
                placeholder="use to differentiate ads"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B]/50 text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-3">
              {t("الرابط النهائي")}
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={generatedUrl || t("أدخل رابط الموقع بالأعلى لرؤية النتيجة")}
                className="w-full h-32 px-4 py-4 bg-zinc-100 dark:bg-[#0a0510] text-[#09090b] dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-xl text-left font-mono break-all focus:outline-none resize-none"
                dir="ltr"
              />
              {generatedUrl && (
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#F0B21B] dark:hover:text-[#F0B21B] border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
