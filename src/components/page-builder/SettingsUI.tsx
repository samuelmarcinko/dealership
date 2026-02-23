'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// ---------------------------------------------------------------------------
// Collapsible settings section
// ---------------------------------------------------------------------------
export function SettingsSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
      >
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Field row: label + content
// ---------------------------------------------------------------------------
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div>{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styled inputs
// ---------------------------------------------------------------------------
const inputCls =
  'w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400 bg-white'

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}

export function TextareaInput({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`${inputCls} resize-none`}
    />
  )
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className={inputCls}
    />
  )
}

export function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {children}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Color picker with hex display + clear
// ---------------------------------------------------------------------------
export function ColorInput({
  value,
  onChange,
  allowEmpty = true,
}: {
  value: string
  onChange: (v: string) => void
  allowEmpty?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
      />
      <span className="text-xs text-slate-500 flex-1 font-mono">{value || '—'}</span>
      {allowEmpty && value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Zrušiť
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------
export function ToggleInput({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 w-full text-left"
    >
      <span
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
          value ? 'bg-orange-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
      <span className="text-sm text-slate-700">{label}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Segmented control (small group of buttons)
// ---------------------------------------------------------------------------
export function SegmentedInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: React.ReactNode }[]
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 text-xs border rounded transition-colors ${
            value === opt.value
              ? 'bg-orange-500 border-orange-500 text-white font-medium'
              : 'border-slate-300 text-slate-600 hover:border-orange-400 hover:text-slate-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Range / slider
// ---------------------------------------------------------------------------
export function RangeInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = 'px',
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1 accent-orange-500"
      />
      <span className="text-xs text-slate-600 w-16 text-right font-mono">
        {value}
        {unit}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Upload button helper
// ---------------------------------------------------------------------------
export function UploadButton({
  onUpload,
  label = 'Nahrať obrázok',
}: {
  onUpload: (url: string) => void
  label?: string
}) {
  const ref = React.useRef<HTMLInputElement>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload/branding', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) onUpload(json.url)
    } catch {
      // silent
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="text-xs text-orange-600 hover:text-orange-700 underline"
      >
        {label}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </>
  )
}
