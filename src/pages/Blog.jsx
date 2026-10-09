import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { blogPosts } from '../data/blogPosts'

function Blog() {
  return (
    <>
      <Helmet>
        <title>PDF Tools Blog — Tutorials, Tips & India Guides | PDF Master Pro</title>
        <meta name="description" content="Free PDF tutorials and guides. Learn to convert bank statements, read GST invoices, compress PDFs, merge files and more. India-specific PDF guides." />
        <link rel="canonical" href="https://pdfmaspro.com/blog" />
        <meta property="og:title" content="PDF Tools Blog — Free Tutorials & India Guides" />
        <meta property="og:description" content="Practical PDF guides for Indian professionals — bank statements, GST, ITR, compression and more." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "PDF Master Pro Blog",
          "url": "https://pdfmaspro.com/blog",
          "description": "Free PDF tutorials and India-specific guides",
          "blogPost": blogPosts.map(p => ({
            "@type": "BlogPosting",
            "headline": p.title,
            "url": `https://pdfmaspro.com/blog/${p.slug}`,
            "datePublished": p.date,
            "description": p.excerpt
          }))
        })}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          PDF Tools Blog
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Free tutorials, tips, and India-specific guides for PDF tools and document management.
        </p>

        <div className="space-y-6">
          {blogPosts.map(post => (
            <article key={post.slug} className="card hover:border-indigo-500/50 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    {post.toolPath && (
                      <Link to={post.toolPath}
                        className="text-xs bg-gray-800 text-gray-400 hover:text-indigo-400 px-2 py-1 rounded-full transition-colors">
                        🔧 Try the tool →
                      </Link>
                    )}
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>📖 {post.readTime} min read</span>
                  </div>
                </div>
                <Link to={`/blog/${post.slug}`}
                  className="shrink-0 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity text-2xl mt-1">
                  →
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <Link to={`/blog/${post.slug}`}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Read full article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Blog
