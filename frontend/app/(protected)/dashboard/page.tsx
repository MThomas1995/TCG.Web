import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { env } from '@/app/env'
import { Card } from '@/app/types/card'
import { CollectionCard } from './CollectionCard'

interface UserCard {
    userCardId: number
    acquiredAt: string
    card: Card
}

const DashboardPage = async () => {
    // cookies() gives us access to the request cookies server-side.
    // The tcg_token is httpOnly so it's never accessible from client JS —
    // only server components and API routes can read it.
    const token = (await cookies()).get('tcg_token')?.value
    if (!token) redirect('/login')

    const res = await fetch(`${env.NEXT_PUBLIC_TCG_API_URL}/me/cards`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store', // Always fetch fresh — collection changes after adding cards.
    })

    if (!res.ok) redirect('/login')

    const userCards: UserCard[] = await res.json()

    return (
        <div
            className="min-h-screen px-6 py-12"
            style={{ background: 'linear-gradient(160deg, #0f2030 0%, #0a1520 50%, #060d12 100%)' }}
        >
            <div className="max-w-2xl mx-auto flex flex-col gap-8">

                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">My Collection</h1>
                    <p className="text-white/40 text-sm">{userCards.length} {userCards.length === 1 ? 'card' : 'cards'}</p>
                </div>

                {userCards.length === 0 ? (
                    <p className="text-white/30 text-sm">No cards yet. Start collecting!</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {userCards.map(({ userCardId, card }) => (
                            <CollectionCard key={userCardId} userCardId={userCardId} card={card} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default DashboardPage
