import React from 'react'
import { Helmet } from 'react-helmet-async'

// Organization Schema — homepage pe use karo
export function OrganizationSchema({ domain = 'https://pdfmaspro.com' }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PDF Master Pro",
    "url": domain,
    "logo": `${domain}/favicon.svg`,
    "description": "Free PDF tools online — merge, split, compress, convert PDFs. No file size limits, no login required, 100% private.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": `${domain}/contact`
    }
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}

// WebApplication Schema — har tool page pe use karo
export function WebAppSchema({ tool, domain = 'https://pdfmaspro.com' }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${tool.name} — PDF Master Pro`,
    "url": `${domain}${tool.path}`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": tool.description,
    "datePublished": "2025-01-01",
    "dateModified": tool.lastUpdated || "2026-10-08",
    "browserRequirements": "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
    "featureList": [
      "No file size limits",
      "No login required",
      "100% private — files stay in browser",
      "Free forever"
    ]
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}

// FAQ Schema — tool pages pe FAQ ke saath use karo
export function FAQSchema({ faqs }) {
  if (!faqs || faqs.length === 0) return null
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}

// BreadcrumbList Schema
export function BreadcrumbSchema({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}

export default { OrganizationSchema, WebAppSchema, FAQSchema, BreadcrumbSchema }
