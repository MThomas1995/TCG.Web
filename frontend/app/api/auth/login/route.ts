import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/app/env'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    // Forward the credentials to the Railway API.
    const apiRes = await fetch(`${env.NEXT_PUBLIC_TCG_API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
    })

    if (!apiRes.ok) {
        const error = await apiRes.json()
        return NextResponse.json(error, { status: apiRes.status })
    }

    const { token } = await apiRes.json()

    // Set the JWT as an httpOnly cookie — JS on the client can never read this.
    // secure: true ensures it's only sent over HTTPS (ignored in dev).
    // sameSite: 'lax' protects against CSRF while allowing normal navigation.
    const response = NextResponse.json({ ok: true })
    response.cookies.set('tcg_token', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   60 * 60 * 24, // 24 hours — matches JWT expiry
        path:     '/',
    })

    return response
}
