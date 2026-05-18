'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const RegisterPage = () => {
    const router = useRouter()

    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [error,    setError]    = useState<string | null>(null)
    const [loading,  setLoading]  = useState(false)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const res = await fetch('/api/auth/register', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }),
        })

        if (!res.ok) {
            const data = await res.json()
            setError(data.message ?? 'Something went wrong.')
            setLoading(false)
            return
        }

        // Registration successful — redirect to login to sign in.
        router.push('/login')
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ background: 'linear-gradient(160deg, #0f2030 0%, #0a1520 50%, #060d12 100%)' }}
        >
            <div className="w-full max-w-sm flex flex-col gap-6">

                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Create account</h1>
                    <p className="text-white/40 text-sm">Join TCG and start your collection</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-white/60 text-xs uppercase tracking-widest font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="rounded-lg px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-white/60 text-xs uppercase tracking-widest font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="rounded-lg px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-white/20"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}
                    >
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="text-white/30 text-sm text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="text-white/60 hover:text-white transition-colors">
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default RegisterPage
