import React from 'react'
import { Helmet } from 'react-helmet-async'

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | PDF Master Pro</title>
        <meta name="description" content="Privacy policy for PDF Master Pro — no file uploads, no personal data collection, Google AdSense advertising disclosure, cookie policy, and user rights." />
        <link rel="canonical" href="https://pdfmaspro.com/privacy-policy" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">
          <strong>Effective date:</strong> January 1, 2025 &nbsp;·&nbsp;
          <strong>Last updated:</strong> October 8, 2026
        </p>

        <div className="text-gray-300 space-y-10">

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Who We Are</h2>
            <p className="leading-relaxed">
              PDF Master Pro (<strong className="text-white">pdfmaspro.com</strong>) is a free online
              PDF tool suite. For privacy-related questions, contact us at{' '}
              <a href="mailto:support@pdfmaspro.com" className="text-indigo-400 hover:underline">
                support@pdfmaspro.com
              </a>{' '}or via our{' '}
              <a href="/contact" className="text-indigo-400 hover:underline">Contact page</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Your Files — 100% Private</h2>
            <p className="leading-relaxed">
              PDF Master Pro processes all files <strong className="text-white">entirely in your browser</strong>{' '}
              using client-side JavaScript. Your documents are <strong className="text-white">never uploaded
              to any server</strong>, never transmitted over the internet during processing, and never stored
              by us in any form. All processing happens locally on your own device.
              This applies to every one of our 32 tools without exception.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              We do not collect personal information directly. However, we use third-party services
              that may collect certain non-personally-identifiable data:
            </p>
            <ul className="space-y-3">
              {[
                ['Google AdSense', 'Displays advertisements. Google may use cookies to serve personalised ads based on your prior visits to this or other websites. See Section 4 below for full disclosure.'],
                ['Razorpay (voluntary support payments)', 'If you choose to support us, Razorpay collects payment information per their own privacy policy. We do not store any payment details.'],
                ['PayPal (voluntary support payments)', 'If you support us via PayPal, PayPal\'s own privacy policy applies. We do not store payment details.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3 bg-gray-800/40 border border-gray-700 rounded-lg p-4">
                  <span className="text-indigo-400 mt-0.5">▸</span>
                  <div>
                    <strong className="text-white">{title}</strong>
                    <span className="text-gray-400"> — {desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              4. Google AdSense & Advertising — Full Disclosure
            </h2>
            <p className="leading-relaxed mb-4">
              PDF Master Pro uses <strong className="text-white">Google AdSense</strong> to display
              advertisements. This is how we fund the service and keep all tools free for everyone.
            </p>
            <ul className="space-y-2 list-disc list-inside text-gray-400 mb-4">
              <li>Google AdSense uses cookies to serve ads based on your prior visits to this website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and other sites on the internet.</li>
              <li>You may opt out of personalised advertising by visiting{' '}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline">Google Ad Settings</a>.
              </li>
              <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website and others.</li>
            </ul>
            <p className="text-sm text-gray-500">
              For more information about how Google uses data when you use our partner's sites or apps, visit{' '}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer"
                className="text-indigo-400 hover:underline">
                policies.google.com/technologies/partner-sites
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Cookies</h2>
            <p className="leading-relaxed mb-3">
              PDF Master Pro itself does not set first-party cookies for user tracking or identification.
              Cookies may be set by third-party services:
            </p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><strong className="text-white">Google AdSense cookies</strong> — for advertising personalisation (opt out via Google Ad Settings)</li>
            </ul>
            <p className="mt-4 leading-relaxed text-gray-400">
              You can control or delete cookies through your browser settings. Disabling cookies may affect
              advertisement display but will not affect the functionality of any PDF tool.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Children's Privacy</h2>
            <p className="leading-relaxed">
              PDF Master Pro does not knowingly collect any information from children under the age of 13.
              Our tools are general-purpose utilities not directed at children. If you believe a child has
              provided us with personal information, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="leading-relaxed">
              Since we do not collect personal data directly, there is generally no personal data to access,
              correct, or delete on our end. For data held by third-party services (Google, Razorpay, PayPal),
              refer to their respective privacy policies. If you have a specific concern, contact us and
              we will assist where possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. When we do, we will update the
              "Last updated" date at the top of this page. Continued use of PDF Master Pro after any
              changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. Contact</h2>
            <p className="leading-relaxed">
              For any privacy-related questions, please contact us via our{' '}
              <a href="/contact" className="text-indigo-400 hover:underline">Contact page</a>.
              We aim to respond within 48 hours.
            </p>
          </section>

        </div>
      </div>
    </>
  )
}
