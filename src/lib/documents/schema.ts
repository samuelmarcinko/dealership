import { z } from 'zod'

export const customFieldSchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/, 'Kľúč môže obsahovať len malé písmená, číslice a _'),
  label: z.string().min(1, 'Popis poľa je povinný'),
  type: z.enum(['text', 'number', 'date', 'checkbox', 'textarea']).default('text'),
  defaultValue: z.string().optional().default(''),
})

export type CustomField = z.infer<typeof customFieldSchema>

export const templateInputSchema = z.object({
  name: z.string().min(1, 'Názov je povinný'),
  description: z.string().nullable().optional(),
  content: z.string().default(''),
  context: z.enum(['INTAKE', 'SALE', 'BOTH']).default('SALE'),
  customerType: z.enum(['PERSON', 'COMPANY']).nullable().optional(),
  customFields: z.array(customFieldSchema).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

/** Bezpečne prečíta customFields z Json stĺpca. */
export function parseCustomFields(value: unknown): CustomField[] {
  const result = z.array(customFieldSchema).safeParse(value)
  return result.success ? result.data : []
}
