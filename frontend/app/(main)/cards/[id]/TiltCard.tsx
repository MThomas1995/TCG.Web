'use client'

import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import Tilt from "react-parallax-tilt"

interface TiltCardProps {
    src: string
    alt: string
}

export const TiltCard = ({ src, alt }: TiltCardProps) => {
    const wrapperRef  = useRef<HTMLDivElement>(null)
    const foilRef     = useRef<HTMLDivElement>(null)
    const sheenRef    = useRef<HTMLDivElement>(null)
    const isHovering  = useRef(false)

    const [foilEnabled,  setFoilEnabled]  = useState(true)
    const [sheenEnabled, setSheenEnabled] = useState(true)

    const resetOverlays = () => {
        if (foilRef.current)  foilRef.current.style.opacity  = '0'
        if (sheenRef.current) sheenRef.current.style.opacity = '0'
    }

    // Reset overlays whenever toggles change while not hovering
    useEffect(() => {
        if (!isHovering.current) resetOverlays()
    }, [foilEnabled, sheenEnabled])

    // Prevent native scroll so Tilt can handle touch movement.
    // touch-action: none is applied directly to the Tilt component's div (via its
    // style prop) and to this wrapper. The CSS approach is evaluated before any JS
    // runs — it's the only reliable way to stop the browser committing to scroll
    // at touchstart. We still add a non-passive touchmove listener as a fallback,
    // but do NOT prevent touchstart — doing so causes iOS Safari to suppress
    // subsequent touchmove events, breaking the tilt entirely.
    useEffect(() => {
        const el = wrapperRef.current
        if (!el) return
        const prevent = (e: TouchEvent) => e.preventDefault()
        el.addEventListener('touchmove', prevent, { passive: false })
        return () => el.removeEventListener('touchmove', prevent)
    }, [])

    const handleMove = ({ tiltAngleY, tiltAngleXPercentage, tiltAngleYPercentage }: { tiltAngleY: number, tiltAngleXPercentage: number, tiltAngleYPercentage: number }) => {
        const foil  = foilRef.current
        const sheen = sheenRef.current
        if (!foil || !sheen) return

        // Convert -100..100 percentage to 0..100 for positioning
        const xPct = (tiltAngleYPercentage + 100) / 2
        const yPct = (tiltAngleXPercentage + 100) / 2

        if (foilEnabled) {
            const hue = xPct * 2.4
            foil.style.background = `linear-gradient(
                ${105 + tiltAngleY * 4}deg,
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

    const handleLeave = () => {
        isHovering.current = false
        resetOverlays()
    }

    const handleEnter = () => {
        isHovering.current = true
    }

    return (
        <div
            ref={wrapperRef}
            style={{ animation: 'float 5s ease-in-out infinite', touchAction: 'none' }}
            onMouseLeave={handleLeave}
            onTouchStart={handleEnter}
            onTouchEnd={handleLeave}
        >
        <Tilt
            tiltMaxAngleX={12}
            tiltMaxAngleY={12}
            scale={1.03}
            transitionSpeed={1000}
            onEnter={handleEnter}
            onMove={handleMove}
            onLeave={handleLeave}
            style={{ touchAction: 'none' }}
        >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15" style={{ willChange: 'transform' }}>
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
        </Tilt>
        </div>
    )
}
