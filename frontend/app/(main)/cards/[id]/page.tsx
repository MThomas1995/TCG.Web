
import { Card } from "@/app/types/card"
import { env } from "@/app/env"
import { TiltCard } from "./TiltCard"

const stats = (card: Card) => [
    { label: 'Attack', value: card.stats.attack, color: '#fb923c' },
    { label: 'Defend', value: card.stats.defend, color: '#38bdf8' },
    { label: 'HP',     value: card.stats.hp,     color: '#4ade80' },
]

const fadeUp = (delay: string): React.CSSProperties => ({
    animation: `fade-slide-up 0.6s ease forwards`,
    animationDelay: delay,
    opacity: 0,
})

const CardPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params

    const response = await fetch(`${env.NEXT_PUBLIC_TCG_API_URL}/cards/${id}`)
    const card: Card = await response.json()

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
            style={{ background: 'linear-gradient(160deg, #0f2030 0%, #0a1520 50%, #060d12 100%)' }}
        >
            <div className="w-full max-w-sm flex flex-col gap-5">

                {/* Card image */}
                <div className="relative" style={fadeUp('0s')}>
                    <div
                        className="absolute -inset-4 rounded-3xl blur-3xl"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)', animation: 'glow-pulse 3s ease-in-out infinite' }}
                    />
                    <TiltCard
                        src={card.imagePath}
                        alt={card.name}
                    />
                </div>

                {/* Name & description */}
                <div className="flex flex-col gap-1.5" style={fadeUp('0.2s')}>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">{card.name}</h1>
                    <p className="text-white/45 text-sm leading-relaxed">{card.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    {stats(card).map(({ label, value, color }, i) => (
                        <div
                            key={label}
                            className="flex flex-col gap-2 rounded-xl p-3"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                ...fadeUp(`${0.35 + i * 0.1}s`),
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                <span className="text-white/40 text-xs uppercase tracking-widest font-medium">{label}</span>
                            </div>
                            <span className="text-white text-2xl font-extrabold">{value}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default CardPage
