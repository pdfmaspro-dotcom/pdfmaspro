import React from 'react'
import { Helmet } from 'react-helmet-async'

function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | PDF Master Pro</title>
        <meta name="description" content="Terms of service for PDF Master Pro - Free PDF tools with no warranties. All processing happens client-side in your browser." />
      </Helmet>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="text-gray-300 space-y-6">
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold text-white mt-8">1. Use of Service</h2>
          <p>PDF Master Pro provides free PDF manipulation tools. You agree to use this service for lawful purposes only. You are solely responsible for the files you process.</p>
          <h2 className="text-2xl font-semibold text-white mt-8">2. No Warranty</h2>
          <p>The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.</p>
          <h2 className="text-2xl font-semibold text-white mt-8">3. Limitation of Liability</h2>
          <p>We shall not be liable for any damages arising from the use or inability to use this service, including data loss or corruption.</p>
          <h2 className="text-2xl font-semibold text-white mt-8">4. Local Processing</h2>
          <p>All processing happens locally in your browser. We are not responsible for any issues that may arise from the use of third-party libraries (pdf-lib, pdfjs-dist).</p>
          <h2 className="text-2xl font-semibold text-white mt-8">5. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>
        </div>
      </div>
    </>
  )
}

export default TermsOfService
