import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/app/env'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    const apiRes = await fetch(`${env.NEXT_PUBLIC_TCG_API_URL}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
    })

    const data = await apiRes.json()
    return NextResponse.json(data, { status: apiRes.status })
}
