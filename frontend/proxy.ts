import { NextRequest, NextResponse } from 'next/server'

// Routes that require a logged-in user.
const PROTECTED = ['/dashboard']

// Routes that logged-in users shouldn't see (e.g. login when already authed).
const AUTH_ROUTES = ['/login', '/register']

export function proxy(req: NextRequest) {
    const token    = req.cookies.get('tcg_token')?.value
    const pathname = req.nextUrl.pathname

    // Redirect unauthenticated users away from protected routes.
    if (PROTECTED.some(p => pathname.startsWith(p)) && !token) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from login/register.
    if (AUTH_ROUTES.some(p => pathname.startsWith(p)) && token) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

// Tell Next.js which routes this proxy should run on.
// Excluding static files and API routes keeps it efficient.
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
