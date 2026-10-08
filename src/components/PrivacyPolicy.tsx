import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  return (
    <div className={`min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 ${isRtl ? 'font-cairo' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-xl font-bold">Privacy Policy</h1>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          <h1 className="text-3xl font-black mb-2">Legal</h1>
          <h2 className="text-2xl font-bold text-indigo-500 mb-6">Privacy Policy</h2>
          
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 italic">Last updated: May 2026</p>

          <p className="mb-6 leading-relaxed">
            KH ("we," "us," or "our") operates the website quick ads website and related applications, platforms, and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and integrations with third-party services such as Meta, TikTok, Snapchat, and AI providers.
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">1</span>
              Information We Collect
            </h3>
            
            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-bold mb-3">Information you provide</h4>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Account information — name, email address, company name, and profile information</li>
                <li>Marketing data — advertising account access, campaign settings, creative assets, landing page content, and uploaded media</li>
                <li>Communication data — messages, inquiries, feedback, and support requests</li>
                <li>Authentication data — login credentials and third-party platform access tokens</li>
              </ul>

              <h4 className="font-bold mb-3">Information collected automatically</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Usage data — pages visited, features used, session duration, clicks, and interaction behavior</li>
                <li>Device data — browser type, operating system, IP address, language preference, and device identifiers</li>
                <li>Analytics data — collected to understand platform usage and improve user experience</li>
                <li>Cookies and similar technologies — session cookies, authentication cookies, and analytics tracking technologies</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">2</span>
              How We Use Your Information
            </h3>
            <p className="mb-4">We use collected information to:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Provide, operate, and improve our platform and AI-powered services</li>
              <li>Generate marketing content, landing pages, creatives, scripts, voiceovers, and analytics insights</li>
              <li>Connect and manage advertising platforms such as Meta Ads, TikTok Ads, and Snapchat Ads</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Monitor platform performance and prevent fraud, abuse, or unauthorized access</li>
              <li>Comply with legal obligations and third-party platform requirements</li>
            </ul>
            <p className="font-bold text-indigo-500">We do not sell your personal information to third parties.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">3</span>
              Cookies
            </h3>
            <p className="mb-4">We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-4">
              <li><strong className="text-indigo-500">Essential cookies</strong> — required for authentication, security, and platform functionality</li>
              <li><strong className="text-indigo-500">Analytics cookies</strong> — used to understand user behavior and improve platform performance</li>
              <li><strong className="text-indigo-500">Performance cookies</strong> — help optimize loading speed and overall user experience</li>
            </ul>
            <p className="mt-4">You can disable cookies through your browser settings, although some features may not function properly.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">4</span>
              Third-Party Services
            </h3>
            <p className="mb-4">We may use third-party providers and integrations including:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 'Meta Platforms — authentication and advertising APIs',
                 'TikTok — advertising integrations and analytics',
                 'Snapchat — advertising integrations and analytics',
                 'Google Analytics — analytics and traffic measurement',
                 'Firebase or Supabase — authentication, database, and infrastructure services',
                 'Vercel — hosting and deployment services',
                 'OpenAI and AI providers — AI-generated content and automation features'
               ].map((item, i) => (
                 <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm">
                   {item}
                 </div>
               ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500 italic">These services may collect information according to their own privacy policies.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">5</span>
              Data Retention
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Account information — retained while your account remains active</li>
              <li>Analytics data — retained according to service provider settings</li>
              <li>Session data — automatically deleted after session expiration</li>
              <li>Connected platform tokens — deleted upon account disconnection or deletion requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">6</span>
              Data Security
            </h3>
            <p className="mb-4">We implement reasonable technical and organizational measures to protect your data, including:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['HTTPS Encryption', 'Secure Auth', 'Access Controls', 'Encrypted Storage', 'Monitoring'].map((item, i) => (
                <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center font-bold text-sm">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500 italic">However, no online service can guarantee absolute security.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">7</span>
              Your Rights
            </h3>
            <p className="mb-4">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to certain types of processing</li>
              <li>Request export of your data</li>
            </ul>
            <p>To exercise any of these rights, contact us at: <a href="mailto:support@quickads.ai" className="text-indigo-500 font-bold">support@quickads.ai</a></p>
          </section>

          <section className="mb-8 p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">8</span>
              Egypt Data Protection Compliance
            </h3>
            <p>For users located in Egypt, we comply with Law No. 151 of 2020 concerning the Protection of Personal Data and respect all applicable rights under Egyptian law.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">9</span>
              Children's Privacy
            </h3>
            <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">10</span>
              Changes to This Policy
            </h3>
            <p>We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated revision date.</p>
          </section>

          <section className="bg-zinc-900 text-white p-8 rounded-[2rem] border border-zinc-800">
            <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
            <p className="mb-6 opacity-80">If you have questions regarding this Privacy Policy or your personal data, contact us at:</p>
            <div className="space-y-2">
              <p className="font-bold text-xl">KH</p>
              <a href="mailto:support@khquickads.com" className="text-indigo-400 font-bold block hover:underline">support@khquickads.com</a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-zinc-500">© 2026 Quick Ads | KH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
