'use client'

import Image from "next/image"
import { useRef, useState } from "react"

interface TiltCardProps {
    src: string
    alt: string
}

export const TiltCard = ({ src, alt }: TiltCardProps) => {
    const cardRef  = useRef<HTMLDivElement>(null)
    const foilRef  = useRef<HTMLDivElement>(null)
    const sheenRef = useRef<HTMLDivElement>(null)

    const [foilEnabled,  setFoilEnabled]  = useState(true)
    const [sheenEnabled, setSheenEnabled] = useState(true)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card  = cardRef.current
        const foil  = foilRef.current
        const sheen = sheenRef.current
        if (!card || !foil || !sheen) return

        const rect    = card.getBoundingClientRect()
        const x       = e.clientX - rect.left
        const y       = e.clientY - rect.top
        const xPct    = (x / rect.width) * 100
        const yPct    = (y / rect.height) * 100
        const rotateY = ((x / rect.width)  - 0.5) * 24
        const rotateX = ((y / rect.height) - 0.5) * -24

        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`

        if (foilEnabled) {
            const hue = xPct * 2.4
            foil.style.background = `linear-gradient(
                ${105 + rotateY * 4}deg,
                hsla(${hue},       100%, 65%, 0.25) 0%,
                hsla(${hue + 60},  100%, 65%, 0.2)  25%,
                hsla(${hue + 120}, 100%, 65%, 0.25) 50%,
                hsla(${hue + 180}, 100%, 65%, 0.2)  75%,
                hsla(${hue + 240}, 100%, 65%, 0.25) 100%
            )`
            foil.style.opacity = '1'
        }

        if (sheenEnabled) {
            sheen.style.background = `radial-gradient(circle at ${xPct}% ${yPct}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)`
            sheen.style.opacity = '1'
        }
    }

    const handleMouseLeave = () => {
        const card  = cardRef.current
        const foil  = foilRef.current
        const sheen = sheenRef.current
        if (!card || !foil || !sheen) return

        card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)'
        foil.style.opacity   = '0'
        sheen.style.opacity  = '0'
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ animation: 'float 5s ease-in-out infinite' }}
        >
            <div
                ref={cardRef}
                className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15"
                style={{ transition: 'transform 0.15s ease', willChange: 'transform' }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={400}
                    height={400}
                    style={{ width: 'auto', objectFit: 'cover' }}
                    loading="eager"
                />
                <div
                    ref={foilRef}
                    className="absolute inset-0 pointer-events-none mix-blend-color-dodge"
                    style={{ opacity: 0, transition: 'opacity 0.3s ease', borderRadius: 'inherit' }}
                />
                <div
                    ref={sheenRef}
                    className="absolute inset-0 pointer-events-none mix-blend-screen"
                    style={{ opacity: 0, transition: 'opacity 0.2s ease', borderRadius: 'inherit' }}
                />

                {/* Toggles — pinned to bottom of card */}
                <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                    {[
                        { label: 'Foil',  enabled: foilEnabled,  toggle: () => setFoilEnabled(f => !f) },
                        { label: 'Sheen', enabled: sheenEnabled, toggle: () => setSheenEnabled(s => !s) },
                    ].map(({ label, enabled, toggle }) => (
                        <button
                            key={label}
                            onClick={toggle}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-widest transition-all"
                            style={{
                                background: enabled ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)',
                                border: `1px solid ${enabled ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                color: enabled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(6px)',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
