import React from 'react'
import { Helmet } from 'react-helmet-async'

export default function About() {
  return (
    <>
      <Helmet>
        <title>About PDF Master Pro — Free PDF Tools for India | pdfmaspro.com</title>
        <meta name="description" content="PDF Master Pro offers 32 free browser-based PDF tools — no file size limits, no login, 100% private. Learn about our mission and how it works." />
        <link rel="canonical" href="https://pdfmaspro.com/about" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">About PDF Master Pro</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-10 text-gray-300">

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Who We Are</h2>
            <p className="leading-relaxed">
              PDF Master Pro is a free, browser-based PDF tool suite offering 32 tools — merge, split,
              compress, convert, unlock, and more. We built PDF Master Pro to give Indian professionals,
              students, and businesses access to professional-grade PDF tools with absolutely no
              restrictions, no cost, and complete privacy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">What Makes Us Different</h2>
            <ul className="space-y-4">
              {[
                ['No file size limits', 'Process PDFs of any size, completely free. No upgrade required.'],
                ['No login or registration', 'Use all 32 tools instantly — no account, no email, no password.'],
                ['100% private', 'Every file is processed locally in your browser. Files are never uploaded to any server, anywhere.'],
                ['No daily caps', 'Use any tool as many times as you need, every day.'],
                ['India-specific tools', 'Bank Statement Converter (SBI, HDFC, ICICI, Axis, Kotak and more) and GST Invoice Reader built specifically for Indian financial documents.'],
                ['Hindi language support', 'Full interface available in Hindi for Indian users.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="text-green-400 mt-0.5 text-lg">✓</span>
                  <div>
                    <strong className="text-white">{title}</strong>
                    <span className="text-gray-400"> — {desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">How It Works</h2>
            <p className="leading-relaxed">
              All 32 tools run entirely in your web browser using open-source JavaScript libraries —
              primarily <strong className="text-white">pdf-lib</strong> for PDF creation and editing,
              and <strong className="text-white">pdfjs-dist</strong> for rendering and reading.
              When you upload a file, it stays in your browser's memory, gets processed on your own device,
              and downloads directly back to you. No file ever leaves your device. No server processes your document.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Our Mission</h2>
            <p className="leading-relaxed">
              To make professional-grade PDF tools genuinely free and private for everyone — especially
              Indian users who are underserved by tools built for Western markets.
              PDF Master Pro is funded by Google AdSense advertising and voluntary user support
              via Razorpay and PayPal, which allows us to keep all 32 tools free for everyone, indefinitely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Contact Us</h2>
            <p className="leading-relaxed">
              For questions, feedback, or bug reports, email us at{' '}
              <a href="mailto:support@pdfmaspro.com" className="text-indigo-400 hover:underline font-medium">
                support@pdfmaspro.com
              </a>{' '}
              or use our{' '}
              <a href="/contact" className="text-indigo-400 hover:underline">Contact page</a>.
              We respond to all genuine queries within 48 hours.
            </p>
          </section>

        </div>
      </div>
    </>
  )
}
