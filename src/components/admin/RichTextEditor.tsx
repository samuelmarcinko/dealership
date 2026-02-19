'use client'

import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Minus,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'underline text-primary' } }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[240px] prose prose-slate max-w-none p-4 text-sm focus:outline-none',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL odkazu', prev ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const btnBase =
    'p-1.5 rounded hover:bg-slate-100 transition-colors text-slate-600 disabled:opacity-40'
  const activeBtn = 'bg-slate-200 text-slate-900'

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          title="Tučné"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnBase} ${editor.isActive('bold') ? activeBtn : ''}`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Kurzíva"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnBase} ${editor.isActive('italic') ? activeBtn : ''}`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1" />
        <button
          type="button"
          title="Nadpis H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? activeBtn : ''}`}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Nadpis H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btnBase} ${editor.isActive('heading', { level: 3 }) ? activeBtn : ''}`}
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1" />
        <button
          type="button"
          title="Zoznam"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${editor.isActive('bulletList') ? activeBtn : ''}`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Číslovaný zoznam"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${editor.isActive('orderedList') ? activeBtn : ''}`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-slate-300 mx-1" />
        <button
          type="button"
          title="Odkaz"
          onClick={setLink}
          className={`${btnBase} ${editor.isActive('link') ? activeBtn : ''}`}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Horizontálna čiara"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnBase}
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
