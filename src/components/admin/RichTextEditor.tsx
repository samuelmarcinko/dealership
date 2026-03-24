'use client'

import { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Link2, Link2Off,
  Undo2, Redo2, RemoveFormatting,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function ToolBtn({
  active, disabled, onClick, title, children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      /* onMouseDown + preventDefault keeps editor focused while clicking toolbar */
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        active
          ? 'bg-orange-100 text-orange-700'
          : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800',
        disabled && 'opacity-30 pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'rte-link' },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: {
        class: 'rte-content focus:outline-none',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string
    const url = window.prompt('URL odkazu', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 transition-all">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Tučné (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Kurzíva (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-slate-200 mx-1 self-center" />

        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Nadpis H2">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Nadpis H3">
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-slate-200 mx-1 self-center" />

        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Zoznam s odrážkami">
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Číslovaný zoznam">
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-slate-200 mx-1 self-center" />

        <ToolBtn active={editor.isActive('link')} onClick={setLink} title="Vložiť / upraviť odkaz">
          <Link2 className="h-4 w-4" />
        </ToolBtn>
        {editor.isActive('link') && (
          <ToolBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Odstrániť odkaz">
            <Link2Off className="h-4 w-4" />
          </ToolBtn>
        )}

        <span className="w-px h-5 bg-slate-200 mx-1 self-center" />

        <ToolBtn active={false} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Späť (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={false} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Znova (Ctrl+Y)">
          <Redo2 className="h-4 w-4" />
        </ToolBtn>

        <span className="w-px h-5 bg-slate-200 mx-1 self-center" />

        <ToolBtn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Odstrániť formátovanie">
          <RemoveFormatting className="h-4 w-4" />
        </ToolBtn>
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}
