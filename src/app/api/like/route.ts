import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Simple file-based counter for prototype stage
// For production: swap this with a database (Vercel KV, Supabase, etc.)
const COUNTER_FILE = path.join('/tmp', 'likes.json')

async function getCount(): Promise<number> {
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf-8')
    return JSON.parse(data).count || 0
  } catch {
    return 0
  }
}

async function incrementCount(): Promise<number> {
  const count = await getCount()
  const next = count + 1
  await fs.writeFile(COUNTER_FILE, JSON.stringify({ count: next }))
  return next
}

export async function GET() {
  const count = await getCount()
  return NextResponse.json({ count })
}

export async function POST(req: NextRequest) {
  const count = await incrementCount()
  return NextResponse.json({ count })
}
