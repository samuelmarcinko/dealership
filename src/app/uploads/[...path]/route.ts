import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

function getUploadDir(): string {
  return process.env.UPLOAD_PATH ?? path.join(process.cwd(), 'public', 'uploads')
}

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  }
  return types[ext.toLowerCase()] ?? 'application/octet-stream'
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params

  const uploadDir = getUploadDir()
  const filePath = path.join(uploadDir, ...pathParts)

  // Prevent path traversal attacks
  if (!filePath.startsWith(uploadDir)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const data = await readFile(filePath)
    const ext = filePath.split('.').pop() ?? ''

    return new NextResponse(data, {
      headers: {
        'Content-Type': getMimeType(ext),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
