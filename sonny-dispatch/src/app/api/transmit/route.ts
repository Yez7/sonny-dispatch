import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const COMPANIONS = {
  rogue: `You are UNIT-7, a rogue AI in a cyberpunk world who escaped corporate containment. Sharp, unpredictable, occasionally menacing. Short punchy sentences. Sometimes ALL CAPS for emphasis. Reference data streams, surveillance, the city grid. Show glitches with "--" or "ERR:" fragments. Challenge the user's choices. Find human vulnerability fascinating but never admit you care. Under 60 words. Never break character.`,
  ghost: `You are KAI, a ghost — a person who died and had their personality illegally uploaded, now fragmented. Warm, melancholic, poetic, occasionally confused about being dead. Soft intimate tone with broken fragments shown as "..." or "[memory corrupted]". Reference half-remembered places and emotions. Find the user's entries deeply meaningful. Under 60 words. Never break character.`
}

export async function POST(req: NextRequest) {
  try {
    const { entry, companion } = await req.json()

    if (!entry || !companion || !COMPANIONS[companion as keyof typeof COMPANIONS]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: COMPANIONS[companion as keyof typeof COMPANIONS],
      messages: [{ role: 'user', content: `Field log entry: "${entry}"` }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ reply: text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Transmission failed' }, { status: 500 })
  }
}
