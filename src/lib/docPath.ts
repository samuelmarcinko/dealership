import path from 'path'

export function getTemplatesDir(): string {
  const base = process.env.PDF_PATH ?? path.join(process.cwd(), 'pdfs')
  return path.join(base, 'templates')
}
