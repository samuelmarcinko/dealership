'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { Upload, X, Star, GripVertical, Info, Settings, FileText, ImageIcon, Tag } from 'lucide-react'
import type { VehicleWithImages } from '@/types'

interface Props {
  vehicle?: VehicleWithImages
}

interface LocalImage {
  id?: string
  url: string
  file?: File
  isPrimary: boolean
}

const FUEL_TYPES = [
  { value: 'PETROL', label: 'Benzín' },
  { value: 'DIESEL', label: 'Nafta' },
  { value: 'ELECTRIC', label: 'Elektro' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
]

const TRANSMISSIONS = [
  { value: 'MANUAL', label: 'Manuál' },
  { value: 'AUTOMATIC', label: 'Automat' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-automat' },
]

const BODY_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'ESTATE', label: 'Kombi' },
  { value: 'SUV', label: 'SUV' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Kabriolet' },
  { value: 'VAN', label: 'Van' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'OTHER', label: 'Iné' },
]

const STATUSES = [
  { value: 'AVAILABLE', label: 'Dostupné' },
  { value: 'RESERVED', label: 'Rezervované' },
  { value: 'SOLD', label: 'Predané' },
]

const CURRENT_YEAR = new Date().getFullYear()

function initImages(vehicle?: VehicleWithImages): LocalImage[] {
  if (!vehicle) return []
  return [...vehicle.images]
    .sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      return a.sortOrder - b.sortOrder
    })
    .map((img) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary }))
}

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const [fuelType, setFuelType] = useState<string>(vehicle?.fuelType ?? 'DIESEL')
  const [transmission, setTransmission] = useState<string>(vehicle?.transmission ?? 'MANUAL')
  const [bodyType, setBodyType] = useState<string>(vehicle?.bodyType ?? '')
  const [status, setStatus] = useState<string>(vehicle?.status ?? 'AVAILABLE')

  const [images, setImages] = useState<LocalImage[]>(initImages(vehicle))
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const isEdit = !!vehicle

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setImages((prev) => {
      const hasPrimary = prev.some((img) => img.isPrimary)
      return [
        ...prev,
        ...files.map((file, i) => ({
          url: URL.createObjectURL(file),
          file,
          isPrimary: !hasPrimary && i === 0,
        })),
      ]
    })
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const img = prev[index]
      if (img.id) setDeletedImageIds((ids) => [...ids, img.id!])
      const updated = prev.filter((_, i) => i !== index)
      if (img.isPrimary && updated.length > 0) {
        updated[0] = { ...updated[0], isPrimary: true }
      }
      return updated
    })
  }

  function setPrimaryImage(index: number) {
    setImages((prev) => {
      const updated = prev.map((img, i) => ({ ...img, isPrimary: i === index }))
      const [primary] = updated.splice(index, 1)
      return [primary, ...updated]
    })
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    setImages((prev) => {
      const updated = [...prev]
      const [dragged] = updated.splice(dragIndex, 1)
      updated.splice(index, 0, dragged)
      const primaryIdx = updated.findIndex((img) => img.isPrimary)
      if (primaryIdx > 0) {
        const [primary] = updated.splice(primaryIdx, 1)
        updated.unshift(primary)
      }
      return updated
    })
    setDragIndex(null)
    setDragOverIndex(null)
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.url as string
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const data = new FormData(e.currentTarget)

    const priceVal = parseFloat(data.get('price') as string)
    const salePriceRaw = (data.get('salePrice') as string).trim()
    const salePriceVal = salePriceRaw ? parseFloat(salePriceRaw) : null

    if (salePriceVal !== null && salePriceVal >= priceVal) {
      toast('error', 'Zľavnená cena musí byť nižšia ako inzerovaná cena')
      setLoading(false)
      return
    }

    const body = {
      title: data.get('title') as string,
      make: data.get('make') as string,
      model: data.get('model') as string,
      variant: isEdit ? ((data.get('variant') as string) || null) : null,
      year: parseInt(data.get('year') as string),
      price: priceVal,
      salePrice: salePriceVal,
      mileage: parseInt(data.get('mileage') as string),
      fuelType,
      transmission,
      bodyType: bodyType || null,
      engineCapacity: data.get('engineCapacity') ? parseInt(data.get('engineCapacity') as string) : null,
      power: data.get('power') ? parseInt(data.get('power') as string) : null,
      color: (data.get('color') as string) || null,
      doors: data.get('doors') ? parseInt(data.get('doors') as string) : null,
      seats: data.get('seats') ? parseInt(data.get('seats') as string) : null,
      description: (data.get('description') as string) || null,
      features: (data.get('features') as string)
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      vin: (data.get('vin') as string) || null,
      status,
    }

    try {
      const vehicleRes = await fetch(
        isEdit ? `/api/vehicles/${vehicle.id}` : '/api/vehicles',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )

      if (!vehicleRes.ok) {
        const json = await vehicleRes.json()
        toast('error', json.error ?? 'Nastala chyba')
        return
      }

      const { data: savedVehicle } = await vehicleRes.json()
      const vehicleId = savedVehicle.id

      for (const imageId of deletedImageIds) {
        await fetch(`/api/vehicles/${vehicleId}/images?imageId=${imageId}`, { method: 'DELETE' })
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (img.file) {
          const url = await uploadImage(img.file)
          await fetch(`/api/vehicles/${vehicleId}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, isPrimary: img.isPrimary, sortOrder: i }),
          })
        } else if (img.id) {
          await fetch(`/api/vehicles/${vehicleId}/images`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId: img.id, isPrimary: img.isPrimary, sortOrder: i }),
          })
        }
      }

      toast('success', isEdit ? 'Vozidlo aktualizované' : 'Vozidlo pridané')
      router.push('/admin/vehicles')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast('error', 'Nastala chyba pri ukladaní')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Základné informácie ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <Info className="h-4 w-4 text-orange-600" />
            </span>
            Základné informácie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Názov inzerátu *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={vehicle?.title}
              required
              placeholder="napr. Volkswagen Golf 2.0 TDI"
              className="text-base"
              autoFocus={!isEdit}
            />
            <p className="text-xs text-slate-400">URL adresa vozidla sa vygeneruje automaticky z tohto názvu.</p>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${isEdit ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            <div className="space-y-2">
              <Label htmlFor="make">Značka *</Label>
              <Input id="make" name="make" defaultValue={vehicle?.make} required placeholder="Volkswagen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" name="model" defaultValue={vehicle?.model} required placeholder="Golf" />
            </div>
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="variant">Variant</Label>
                <Input id="variant" name="variant" defaultValue={vehicle?.variant ?? ''} placeholder="2.0 TDI Highline" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Rok výroby *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min={1900}
                max={2030}
                defaultValue={vehicle?.year ?? CURRENT_YEAR}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Inzerovaná cena (€) *</Label>
              <Input id="price" name="price" type="number" step="0.01" min={0} defaultValue={vehicle?.price.toString()} required placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Najazdené (km) *</Label>
              <Input id="mileage" name="mileage" type="number" min={0} defaultValue={vehicle?.mileage} required placeholder="0" />
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${isEdit ? 'sm:grid-cols-2' : ''}`}>
            <div className="space-y-2">
              <Label htmlFor="salePrice">
                Zľavnená cena (€)
                <span className="text-slate-400 font-normal text-xs ml-1">— nepovinné</span>
              </Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                min={0}
                defaultValue={vehicle?.salePrice?.toString() ?? ''}
                placeholder="Nechajte prázdne ak nie je zľava"
              />
              <p className="text-xs text-slate-400">Ak vyplníte, musí byť nižšia ako inzerovaná cena. Na webe sa zobrazí ako zľava s preškrtnutou pôvodnou cenou.</p>
            </div>
            {isEdit && (
              <div className="space-y-2">
                <Label>Stav</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Technické parametre ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <Settings className="h-4 w-4 text-blue-600" />
            </span>
            Technické parametre
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Palivo *</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prevodovka *</Label>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRANSMISSIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Karoséria</Label>
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger><SelectValue placeholder="Vyberte..." /></SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engineCapacity">Objem motora (cm³)</Label>
              <Input id="engineCapacity" name="engineCapacity" type="number" min={0} defaultValue={vehicle?.engineCapacity ?? ''} placeholder="1968" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="power">Výkon (kW)</Label>
              <Input id="power" name="power" type="number" min={0} defaultValue={vehicle?.power ?? ''} placeholder="110" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doors">Počet dverí</Label>
              <Input id="doors" name="doors" type="number" min={2} max={6} defaultValue={vehicle?.doors ?? ''} placeholder="5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Počet miest</Label>
              <Input id="seats" name="seats" type="number" min={1} max={9} defaultValue={vehicle?.seats ?? ''} placeholder="5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Farba</Label>
              <Input id="color" name="color" defaultValue={vehicle?.color ?? ''} placeholder="napr. Čierna metalíza" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">
                VIN číslo
                <span className="text-slate-400 font-normal text-xs ml-1">— nepovinné</span>
              </Label>
              <Input
                id="vin"
                name="vin"
                defaultValue={vehicle?.vin ?? ''}
                placeholder="napr. WV2ZZZ2FZP1234567"
                maxLength={17}
                className="uppercase"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Popis a výbava ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-green-600" />
            </span>
            Popis a výbava
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Popis vozidla</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={vehicle?.description ?? ''}
              placeholder="Popíšte stav vozidla, históriu servisu, dôvod predaja a iné dôležité informácie..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">
              Výbava
              <span className="text-slate-400 font-normal text-xs ml-1">(oddelené čiarkou)</span>
            </Label>
            <Textarea
              id="features"
              name="features"
              rows={3}
              defaultValue={vehicle?.features.join(', ') ?? ''}
              placeholder="Navigácia, Kúrené sedenie, LED svetlá, Parkovacia kamera, ..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Fotografie ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-purple-600" />
            </span>
            Fotografie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium text-sm">Kliknite pre nahratie fotografií</p>
            <p className="text-slate-400 text-xs mt-1">JPG, PNG, WebP — max 10 MB na fotografiu</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {images.length > 0 && (
            <>
              <p className="text-xs text-slate-400">
                Ťahajte fotky pre zmenu poradia. Prvá fotka (s hviezdičkou) sa zobrazuje ako hlavná.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div
                    key={img.id ?? img.url}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                    className={`relative group cursor-grab active:cursor-grabbing transition-opacity ${
                      dragIndex === index ? 'opacity-40' : ''
                    } ${dragOverIndex === index && dragIndex !== index ? 'ring-2 ring-orange-400 rounded-lg' : ''}`}
                  >
                    <div className={`aspect-square rounded-lg overflow-hidden border-2 ${img.isPrimary ? 'border-orange-500' : 'border-transparent'}`}>
                      <Image
                        src={img.url}
                        alt={`Vehicle image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                        quality={85}
                      />
                    </div>

                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <GripVertical className="h-4 w-4 text-white drop-shadow" />
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center"
                          title="Nastaviť ako hlavnú"
                        >
                          <Star className="h-3.5 w-3.5 text-white" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center"
                        title="Odstrániť"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>

                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        Hlavná
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Sticky action bar ── */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-6 px-6 py-4 flex items-center gap-3 z-10">
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
          disabled={loading}
        >
          {loading
            ? (isEdit ? 'Ukladám...' : 'Pridávam...')
            : (isEdit ? 'Uložiť zmeny' : 'Pridať vozidlo')}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Zrušiť
        </Button>
        {!isEdit && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <Tag className="h-3.5 w-3.5" />
            Stav: Dostupné (predvolené)
          </span>
        )}
      </div>
    </form>
  )
}
