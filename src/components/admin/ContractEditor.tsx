'use client'

import { useCallback, useState } from 'react'
import { useEditor, EditorContent, Node, Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Table as TableIcon, Rows3, Columns3, Trash2,
  Scissors, Undo2, Redo2, RemoveFormatting, Braces, Code2, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLACEHOLDER_GROUPS } from '@/lib/documents/placeholders'

// ── Zalomenie strany ───────────────────────────────────────────────────────

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  parseHTML: () => [{ tag: 'div[data-page-break]' }],
  renderHTML: () => ['div', { 'data-page-break': 'true', class: 'page-break' }],
})

// ── Zvýraznenie {premenných} ───────────────────────────────────────────────

const tokenKey = new PluginKey('placeholderHighlight')

const PlaceholderHighlight = Extension.create({
  name: 'placeholderHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: tokenKey,
        props: {
          decorations(state) {
            const decos: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return
              for (const m of node.text.matchAll(/\{[a-z0-9_]+\}/gi)) {
                const from = pos + (m.index ?? 0)
                decos.push(
                  Decoration.inline(from, from + m[0].length, {
                    class: 'contract-token',
                  }),
                )
              }
            })
            return DecorationSet.create(state.doc, decos)
          },
        },
      }),
    ]
  },
})

// ── Tlačidlo panela ────────────────────────────────────────────────────────

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
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        active ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800',
        disabled && 'opacity-30 pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="w-px h-5 bg-slate-200 mx-1 self-center" />

interface Props {
  value: string
  onChange: (html: string) => void
  /** Zobraziť menu na vkladanie premenných (pri úprave šablóny). */
  showVariables?: boolean
  minHeight?: number
}

export default function ContractEditor({
  value, onChange, showVariables = true, minHeight = 500,
}: Props) {
  const [varsOpen, setVarsOpen] = useState(false)
  const [mode, setMode] = useState<'visual' | 'html'>('visual')
  const [htmlDraft, setHtmlDraft] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TableKit.configure({ table: { resizable: true } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      PageBreak,
      PlaceholderHighlight,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: { class: 'contract-content focus:outline-none' },
    },
  })

  const insertVariable = useCallback((key: string) => {
    editor?.chain().focus().insertContent(`{${key}}`).run()
    setVarsOpen(false)
  }, [editor])

  function openHtml() {
    if (!editor) return
    setHtmlDraft(editor.getHTML())
    setVarsOpen(false)
    setMode('html')
  }

  function openVisual() {
    if (!editor) return
    // setContent emituje update, takže sa onChange zavolá s normalizovaným HTML
    editor.commands.setContent(htmlDraft)
    setMode('visual')
  }

  if (!editor) return null

  const inTable = editor.isActive('table')

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 transition-all">
      {/* ── Prepínač Vizuálne / HTML ── */}
      <div className="flex items-center gap-1 px-2 pt-2 bg-slate-50 border-b border-slate-200">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); if (mode !== 'visual') openVisual() }}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-t-md border border-b-0 -mb-px transition-colors',
            mode === 'visual'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800',
          )}
        >
          <Eye className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
          Vizuálne
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); if (mode !== 'html') openHtml() }}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-t-md border border-b-0 -mb-px transition-colors',
            mode === 'html'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800',
          )}
        >
          <Code2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
          HTML
        </button>
      </div>

      {mode === 'html' ? (
        <div className="bg-white">
          <textarea
            value={htmlDraft}
            onChange={(e) => { setHtmlDraft(e.target.value); onChange(e.target.value) }}
            spellCheck={false}
            className="w-full font-mono text-xs leading-relaxed p-4 border-0 focus:outline-none resize-y bg-white text-slate-800"
            style={{ minHeight }}
          />
          <p className="px-4 py-2.5 text-[11px] text-slate-500 border-t border-slate-100 bg-slate-50">
            Po prepnutí späť na <strong>Vizuálne</strong> sa HTML načíta do editora. Zachovajú sa
            nadpisy, odseky, zoznamy, tabuľky, odkazy, zarovnanie a zalomenie strany — ostatné
            značky a štýly editor odstráni.
          </p>
        </div>
      ) : (
      <>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Tučné">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Kurzíva">
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Podčiarknuté">
          <UnderlineIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Prečiarknuté">
          <Strikethrough className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Nadpis dokumentu">
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Článok">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Podnadpis">
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Vľavo">
          <AlignLeft className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Na stred">
          <AlignCenter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Vpravo">
          <AlignRight className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Do bloku">
          <AlignJustify className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Odrážky">
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Číslovaný zoznam">
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          active={inTable}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()}
          title="Vložiť tabuľku"
        >
          <TableIcon className="h-4 w-4" />
        </ToolBtn>
        {inTable && (
          <>
            <ToolBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Pridať riadok">
              <Rows3 className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Pridať stĺpec">
              <Columns3 className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Zmazať tabuľku">
              <Trash2 className="h-4 w-4" />
            </ToolBtn>
          </>
        )}

        <ToolBtn onClick={() => editor.chain().focus().insertContent({ type: 'pageBreak' }).run()} title="Zalomiť stranu">
          <Scissors className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Späť">
          <Undo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Znova">
          <Redo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Odstrániť formátovanie">
          <RemoveFormatting className="h-4 w-4" />
        </ToolBtn>

        {showVariables && (
          <>
            <Divider />
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setVarsOpen((o) => !o) }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  varsOpen ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-200',
                )}
              >
                <Braces className="h-3.5 w-3.5" />
                Vložiť premennú
              </button>

              {varsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onMouseDown={() => setVarsOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                    {PLACEHOLDER_GROUPS.map((group) => (
                      <div key={group.title} className="mb-3 last:mb-0">
                        <div className="px-2 py-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {group.title}
                          </p>
                          {group.hint && (
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{group.hint}</p>
                          )}
                        </div>
                        {group.items.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); insertVariable(item.key) }}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-orange-50 group"
                          >
                            <span className="text-xs text-slate-700 group-hover:text-orange-700">{item.label}</span>
                            <code className="block text-[11px] text-slate-400 font-mono">{`{${item.key}}`}</code>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-slate-100 p-4 overflow-auto" style={{ maxHeight: minHeight + 120 }}>
        <div className="mx-auto bg-white shadow-sm" style={{ maxWidth: '210mm', minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      </>
      )}
    </div>
  )
}
