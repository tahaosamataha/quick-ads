import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function TermsOfService() {
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
            <h1 className="text-xl font-bold">Terms of Service</h1>
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
          <h2 className="text-2xl font-bold text-indigo-500 mb-6">Terms of Service</h2>
          
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 italic">Last updated: May 2026</p>

          <p className="mb-6 leading-relaxed">
            Welcome to KH. These Terms of Service ("Terms") govern your access to and use of our platform, related applications, software, AI tools, and services operated by KH ("we," "us," or "our").
            <br /><br />
            By accessing or using our services, you agree to these Terms. If you do not agree, you may not use the platform.
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">1</span>
              Use of Services
            </h3>
            <p className="mb-4">KH provides AI-powered marketing and automation tools including, but not limited to:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>AI-generated marketing content</li>
              <li>Landing page generation</li>
              <li>Creative and advertising asset generation</li>
              <li>Voiceovers and scripts</li>
              <li>Marketing analytics and automation</li>
              <li>Advertising platform integrations</li>
            </ul>
            <p className="font-bold text-indigo-500">You agree to use the services only for lawful purposes and in compliance with all applicable laws and platform policies.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">2</span>
              User Accounts
            </h3>
            <p className="mb-4">To access certain features, you may be required to create an account or connect third-party services. You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity conducted through your account</li>
              <li>Ensuring connected third-party accounts are authorized by you</li>
            </ul>
            <p className="italic text-zinc-500">We reserve the right to suspend or terminate accounts involved in unauthorized activity, abuse, fraud, or violations of these Terms.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">3</span>
              Third-Party Integrations
            </h3>
            <p className="mb-4">Our services may integrate with third-party platforms including:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               {[
                 'Meta Platforms',
                 'TikTok',
                 'Snapchat',
                 'Google services',
                 'AI providers and cloud infrastructure services'
               ].map((item, i) => (
                 <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm">
                   {item}
                 </div>
               ))}
            </div>
            <p className="mt-4">Your use of these integrations is also subject to the terms and policies of those third-party providers. We are not responsible for third-party platform outages, policy changes, suspensions, or API limitations.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">4</span>
              AI-Generated Content
            </h3>
            <p className="mb-4">Our platform may generate text, images, creatives, scripts, voiceovers, analytics insights, and marketing recommendations using artificial intelligence. You acknowledge that:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>AI-generated output may contain inaccuracies or incomplete information</li>
              <li>Generated content should be reviewed before commercial or legal use</li>
              <li>You are responsible for ensuring compliance with advertising laws, copyright laws, and platform policies</li>
            </ul>
            <p className="font-bold text-red-500/80">We do not guarantee specific marketing results, ad performance, revenue, or business outcomes.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">5</span>
              Intellectual Property
            </h3>
            <p className="mb-4">All platform software, branding, designs, features, and proprietary technology are owned by KH unless otherwise stated. You may not:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Copy, reproduce, reverse engineer, or resell the platform</li>
              <li>Use the platform to create competing services</li>
              <li>Exploit platform vulnerabilities or security weaknesses</li>
            </ul>
            <p className="font-bold text-indigo-500">You retain ownership of content uploaded by you to the platform.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">6</span>
              Acceptable Use
            </h3>
            <p className="mb-4">You agree not to use the services for:</p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-red-600 dark:text-red-400">
              <li>Illegal activities</li>
              <li>Fraudulent advertising</li>
              <li>Spam or deceptive marketing</li>
              <li>Malware distribution or harmful automation</li>
              <li>Violations of third-party platform rules</li>
              <li>Unauthorized access to systems or data</li>
            </ul>
            <p className="italic text-zinc-500">We reserve the right to remove content or terminate access at our discretion if misuse is detected.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">7</span>
              Payments and Subscriptions
            </h3>
            <p className="mb-4">Certain features may require paid subscriptions or usage-based billing. By purchasing a subscription, you agree that:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Fees may be billed periodically</li>
              <li>Failure to pay may result in service suspension</li>
              <li>Pricing may change with prior notice</li>
            </ul>
            <p className="font-bold">Unless required by law, payments are non-refundable.</p>
          </section>

          <section className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">8</span>
              Disclaimer of Warranties
            </h3>
            <p className="mb-4 font-bold">The services are provided on an "as is" and "as available" basis without warranties of any kind. We do not guarantee:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Uninterrupted availability</li>
              <li>Error-free functionality</li>
              <li>Specific advertising or business results</li>
              <li>Compatibility with all third-party platforms</li>
            </ul>
            <p className="italic text-zinc-500">Use of the services is at your own risk.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">9</span>
              Limitation of Liability
            </h3>
            <p className="mb-4">To the maximum extent permitted by law, KH shall not be liable for:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
               <li>Indirect or consequential damages</li>
               <li>Loss of profits, revenue, or business opportunities</li>
               <li>Advertising account suspensions</li>
               <li>Data loss or unauthorized access</li>
               <li>Third-party platform restrictions or policy actions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">10</span>
              Termination
            </h3>
            <p className="mb-4">We may suspend or terminate access to the services at any time if:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>These Terms are violated</li>
              <li>Fraudulent or abusive activity is detected</li>
              <li>Required by law or third-party platform policies</li>
            </ul>
            <p>You may stop using the services at any time.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">11</span>
              Privacy
            </h3>
            <p>Your use of the platform is also governed by our <a href="/privacy-policy" className="text-indigo-500 font-bold hover:underline">Privacy Policy</a>.</p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">12</span>
              Changes to These Terms
            </h3>
            <p>We may update these Terms periodically. Continued use of the services after updates constitutes acceptance of the revised Terms.</p>
          </section>

          <section className="mb-8 p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm">13</span>
              Governing Law
            </h3>
            <p>These Terms shall be governed in accordance with the laws applicable in Egypt, without regard to conflict of law principles.</p>
          </section>

          <section className="bg-zinc-900 text-white p-8 rounded-[2rem] border border-zinc-800">
            <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
            <p className="mb-6 opacity-80">If you have questions regarding these Terms, contact us at:</p>
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
