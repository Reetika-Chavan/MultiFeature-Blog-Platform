import { NextResponse } from 'next/server'
import { Stack } from '@/app/lib/contentstack'

export async function GET() {
  try {
    const Query = Stack.ContentType('blogpost').Query()

    Query.where('url', '/blog/ai')

    const response = await Query.toJSON().find()

    console.log('Contentstack raw response:', response)

    const entries = response?.[0] || []

    return NextResponse.json(entries)
  } catch (error) {
    console.error('AI Blog API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch AI blog entry' }, { status: 500 })
  }
}
