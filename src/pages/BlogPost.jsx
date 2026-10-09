import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { blogPosts } from '../data/blogPosts'

// Simple markdown-like renderer for blog content
function renderContent(content) {
  if (!content) return null
  const lines = content.trim().split('\n')
  const elements = []
  let i = 0
  let tableLines = []
  let inTable = false

  while (i < lines.length) {
    const line = lines[i]

    // Table detection
    if (line.trim().startsWith('|')) {
      if (!inTable) { inTable = true; tableLines = [] }
      tableLines.push(line)
      if (!lines[i + 1] || !lines[i + 1].trim().startsWith('|')) {
        // Render table
        const rows = tableLines.filter(r => !r.match(/^\|[-| ]+\|$/))
        elements.push(
          <div key={`t${i}`} className="overflow-x-auto my-6">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {rows.map((row, ri) => {
                  const cells = row.split('|').filter(c => c.trim() !== '')
                  const Tag = ri === 0 ? 'th' : 'td'
                  return (
                    <tr key={ri} className={ri === 0 ? 'bg-gray-800' : ri % 2 === 0 ? 'bg-gray-900/30' : ''}>
                      {cells.map((cell, ci) => (
                        <Tag key={ci} className="px-4 py-2 border border-gray-700 text-left">{cell.trim()}</Tag>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
        inTable = false; tableLines = []
      }
      i++; continue
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-white">{line.replace('## ', '')}</h2>)
      i++; continue
    }
    // H3
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-semibold mt-8 mb-3 text-gray-100">{line.replace('### ', '')}</h3>)
      i++; continue
    }
    // Bold text inline
    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-bold text-white my-2">{line.replace(/\*\*/g, '')}</p>)
      i++; continue
    }
    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-indigo-500 pl-4 my-4 text-gray-300 italic bg-indigo-900/10 py-2 rounded-r-lg">
          {line.replace('> ', '')}
        </blockquote>
      )
      i++; continue
    }
    // Horizontal rule
    if (line.trim() === '---') {
      elements.push(<hr key={i} className="border-gray-700 my-6" />)
      i++; continue
    }
    // Empty line
    if (line.trim() === '') { i++; continue }

    // Paragraph with inline formatting
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline">$1</a>')

    elements.push(
      <p key={i} className="text-gray-300 my-3 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }} />
    )
    i++
  }
  return elements
}

function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) return <Navigate to="/blog" replace />

  const relatedPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 3)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "dateModified": post.date,
    "url": `https://pdfmaspro.com/blog/${post.slug}`,
    "author": { "@type": "Organization", "name": "PDF Master Pro" },
    "publisher": {
      "@type": "Organization",
      "name": "PDF Master Pro",
      "logo": { "@type": "ImageObject", "url": "https://pdfmaspro.com/favicon.svg" }
    },
    "keywords": post.keywords,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://pdfmaspro.com/blog/${post.slug}` }
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | PDF Master Pro Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.keywords} />
        <link rel="canonical" href={`https://pdfmaspro.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://pdfmaspro.com/blog/${post.slug}`} />
        <meta property="article:published_time" content={post.date} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-10 max-w-3xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-indigo-400">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-indigo-400">Blog</Link>
          <span>›</span>
          <span className="text-gray-300 truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full">{post.category}</span>
            {post.toolPath && (
              <Link to={post.toolPath}
                className="text-xs bg-gray-800 text-gray-400 hover:text-indigo-400 px-3 py-1 rounded-full border border-gray-700 transition-colors">
                🔧 Try the tool
              </Link>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-white">
            {post.title}
          </h1>
          <p className="text-lg text-gray-400 mb-5 leading-relaxed">{post.excerpt}</p>
          <div className="flex items-center gap-5 text-sm text-gray-500 pb-6 border-b border-gray-800">
            <span>📅 {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>📖 {post.readTime} min read</span>
            <span>✍️ PDF Master Pro</span>
          </div>
        </header>

        {/* CTA — Tool Banner */}
        {post.toolPath && (
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/40 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-300">
              🚀 <strong className="text-white">Try it free</strong> — No login, no file size limits
            </p>
            <Link to={post.toolPath}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Open Tool →
            </Link>
          </div>
        )}

        {/* Article Body */}
        <article className="prose-like">
          {renderContent(post.content)}
        </article>

        {/* Bottom CTA */}
        {post.toolPath && (
          <div className="mt-12 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 rounded-xl p-6 text-center">
            <p className="text-lg font-semibold mb-2">Ready to try it yourself?</p>
            <p className="text-gray-400 text-sm mb-4">Free, no login required, works entirely in your browser.</p>
            <Link to={post.toolPath}
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Open Free Tool →
            </Link>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold mb-6 pb-3 border-b border-gray-800">Related Articles</h2>
            <div className="grid gap-4">
              {relatedPosts.map(related => (
                <Link key={related.slug} to={`/blog/${related.slug}`}
                  className="card hover:border-indigo-500/50 transition-all group flex items-start gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-indigo-400">{related.category}</span>
                    <h3 className="font-semibold mt-1 mb-1 group-hover:text-indigo-400 transition-colors">{related.title}</h3>
                    <p className="text-xs text-gray-500">{related.readTime} min read</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-indigo-400 transition-colors mt-1">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="mt-10 pt-6 border-t border-gray-800">
          <Link to="/blog" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </>
  )
}

export default BlogPost
