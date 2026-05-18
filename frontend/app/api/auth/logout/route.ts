import { NextResponse } from 'next/server'

export async function POST() {
    // Clear the cookie by setting it with maxAge 0.
    const response = NextResponse.json({ ok: true })
    response.cookies.set('tcg_token', '', {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   0,
        path:     '/',
    })

    return response
}
