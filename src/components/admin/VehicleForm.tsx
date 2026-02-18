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
import { Upload, X, Star } from 'lucide-react'
import type { VehicleWithImages } from '@/types'

interface Props {
  vehicle?: VehicleWithImages
}

interface LocalImage {
  id?: string
  url: string
  file?: File
  isPrimary: boolean
  uploading?: boolean
  toDelete?: boolean
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

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  // Form select states
  const [fuelType, setFuelType] = useState(vehicle?.fuelType ?? 'DIESEL')
  const [transmission, setTransmission] = useState(vehicle?.transmission ?? 'MANUAL')
  const [bodyType, setBodyType] = useState(vehicle?.bodyType ?? '')
  const [status, setStatus] = useState(vehicle?.status ?? 'AVAILABLE')

  // Images state
  const [images, setImages] = useState<LocalImage[]>(
    vehicle?.images.map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
    })) ?? []
  )

  const isEdit = !!vehicle

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newImages: LocalImage[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isPrimary: images.length === 0 && files.indexOf(file) === 0,
    }))
    setImages((prev) => [...prev, ...newImages])
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const updated = [...prev]
      if (updated[index].id) {
        // Mark for deletion on server
        updated[index] = { ...updated[index], toDelete: true }
      } else {
        updated.splice(index, 1)
      }
      return updated
    })
  }

  function setPrimaryImage(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    )
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

    const body = {
      title: data.get('title') as string,
      make: data.get('make') as string,
      model: data.get('model') as string,
      variant: data.get('variant') as string || null,
      year: parseInt(data.get('year') as string),
      price: parseFloat(data.get('price') as string),
      mileage: parseInt(data.get('mileage') as string),
      fuelType,
      transmission,
      bodyType: bodyType || null,
      engineCapacity: data.get('engineCapacity') ? parseInt(data.get('engineCapacity') as string) : null,
      power: data.get('power') ? parseInt(data.get('power') as string) : null,
      color: data.get('color') as string || null,
      doors: data.get('doors') ? parseInt(data.get('doors') as string) : null,
      seats: data.get('seats') ? parseInt(data.get('seats') as string) : null,
      description: data.get('description') as string || null,
      features: (data.get('features') as string)
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      status,
    }

    try {
      // 1. Create / update vehicle
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

      // 2. Upload new images
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (img.toDelete && img.id) {
          await fetch(`/api/vehicles/${vehicleId}/images?imageId=${img.id}`, { method: 'DELETE' })
          continue
        }
        if (img.file) {
          const url = await uploadImage(img.file)
          await fetch(`/api/vehicles/${vehicleId}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, isPrimary: img.isPrimary, sortOrder: i }),
          })
        } else if (img.id) {
          // Update existing image (e.g., isPrimary changed)
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

  const visibleImages = images.filter((img) => !img.toDelete)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Základné informácie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Názov inzerátu *</Label>
            <Input id="title" name="title" defaultValue={vehicle?.title} required placeholder="napr. Volkswagen Golf 2.0 TDI" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Značka *</Label>
              <Input id="make" name="make" defaultValue={vehicle?.make} required placeholder="Volkswagen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" name="model" defaultValue={vehicle?.model} required placeholder="Golf" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant">Variant</Label>
              <Input id="variant" name="variant" defaultValue={vehicle?.variant ?? ''} placeholder="2.0 TDI Highline" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Rok výroby *</Label>
              <Input id="year" name="year" type="number" min={1900} max={2030} defaultValue={vehicle?.year} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Cena (€) *</Label>
              <Input id="price" name="price" type="number" step="0.01" min={0} defaultValue={vehicle?.price.toString()} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Najazdené (km) *</Label>
              <Input id="mileage" name="mileage" type="number" min={0} defaultValue={vehicle?.mileage} required />
            </div>
            <div className="space-y-2">
              <Label>Stav</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Technické parametre</CardTitle>
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
              <Label htmlFor="engineCapacity">Objem (cc)</Label>
              <Input id="engineCapacity" name="engineCapacity" type="number" min={0} defaultValue={vehicle?.engineCapacity ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="power">Výkon (hp)</Label>
              <Input id="power" name="power" type="number" min={0} defaultValue={vehicle?.power ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doors">Počet dverí</Label>
              <Input id="doors" name="doors" type="number" min={2} max={6} defaultValue={vehicle?.doors ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Počet miest</Label>
              <Input id="seats" name="seats" type="number" min={1} max={9} defaultValue={vehicle?.seats ?? ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Farba</Label>
            <Input id="color" name="color" defaultValue={vehicle?.color ?? ''} placeholder="napr. Čierna metalíza" />
          </div>
        </CardContent>
      </Card>

      {/* Description & Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Popis a výbava</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Popis vozidla</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={vehicle?.description ?? ''}
              placeholder="Detailný popis stavu vozidla, histórie, výbavy..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Výbava (oddelené čiarkou)</Label>
            <Textarea
              id="features"
              name="features"
              rows={2}
              defaultValue={vehicle?.features.join(', ') ?? ''}
              placeholder="Navigácia, Kúrené sedenie, LED svetlá, ..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Fotografie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload zone */}
          <div
            className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Kliknite pre nahranie fotografií</p>
            <p className="text-slate-400 text-xs mt-1">JPG, PNG, WebP – max 10 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Preview grid */}
          {visibleImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {visibleImages.map((img, index) => (
                <div key={index} className="relative group">
                  <div className={`aspect-square rounded-lg overflow-hidden border-2 ${img.isPrimary ? 'border-orange-500' : 'border-transparent'}`}>
                    <Image
                      src={img.url}
                      alt={`Vehicle image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(images.findIndex((i) => i === (images.filter((im) => !im.toDelete)[index])))}
                      className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center"
                      title="Nastaviť ako hlavnú"
                    >
                      <Star className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(images.findIndex((i) => i === (images.filter((im) => !im.toDelete)[index])))}
                      className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center"
                      title="Odstrániť"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  {img.isPrimary && (
                    <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                      Hlavná
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
          disabled={loading}
        >
          {loading ? 'Ukladám...' : isEdit ? 'Aktualizovať vozidlo' : 'Pridať vozidlo'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Zrušiť
        </Button>
      </div>
    </form>
  )
}
