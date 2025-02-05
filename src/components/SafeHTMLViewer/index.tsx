import React from 'react'
import DOMPurify from 'dompurify'
import 'tapwrite/dist/assets/Tapwrite.css'

const SafeHTMLViewer = ({ content, className }: { content: string; className?: string }) => {
  const clean = DOMPurify.sanitize(content)

  return <div className={`${className} tiptap`} dangerouslySetInnerHTML={{ __html: clean }} />
}

export default SafeHTMLViewer
