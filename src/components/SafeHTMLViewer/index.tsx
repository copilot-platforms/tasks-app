import React from 'react'
import DOMPurify from 'dompurify'
import 'tapwrite/dist/assets/Tapwrite.css'

const SafeHTMLViewer = ({ content, className }: { content: string; className?: string }) => {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'strike',
      'h1',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'a',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
  return <div className={`${className} tiptap`} dangerouslySetInnerHTML={{ __html: clean }} />
}

export default SafeHTMLViewer
