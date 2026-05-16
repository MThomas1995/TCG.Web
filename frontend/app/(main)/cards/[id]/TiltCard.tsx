'use client'

import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import Tilt from "react-parallax-tilt"

interface TiltCardProps {
    src: string
    alt: string
}

const MAX_ANGLE = 12

export const TiltCard = ({ src, alt }: TiltCardProps) => {
    const wrapperRef      = useRef<HTMLDivElement>(null)
    const foilRef         = useRef<HTMLDivElement>(null)
    const sheenRef        = useRef<HTMLDivElement>(null)
    const isHovering      = useRef(false)

    // Refs so touch handlers always read the current toggle state without needing
    // the effect to re-run (and re-attach listeners) every time a toggle changes.
    const foilEnabledRef  = useRef(true)
    const sheenEnabledRef = useRef(true)

    const [foilEnabled,  setFoilEnabled]  = useState(true)
    const [sheenEnabled, setSheenEnabled] = useState(true)

    useEffect(() => { foilEnabledRef.current  = foilEnabled  }, [foilEnabled])
    useEffect(() => { sheenEnabledRef.current = sheenEnabled }, [sheenEnabled])

    const resetOverlays = () => {
        if (foilRef.current)  foilRef.current.style.opacity  = '0'
        if (sheenRef.current) sheenRef.current.style.opacity = '0'
    }

    useEffect(() => {
        if (!isHovering.current) resetOverlays()
    }, [foilEnabled, sheenEnabled])

    // Touch tilt — fully native, completely bypassing the library's touch path.
    //
    // Why not use the library for touch?
    // The library uses React's onTouchMove synthetic event, which React attaches
    // passively. Passive listeners cannot call preventDefault(), so the browser
    // scrolls regardless. Non-passive native listeners on the wrapper let us call
    // preventDefault() and own the touch entirely.
    //
    // We also call stopPropagation() so the events never reach React's delegation
    // layer — preventing the library from writing its own transform on top of ours.
    useEffect(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) return

        // The Tilt library applies its CSS transform to its own root div,
        // which is the direct first child of our wrapper.
        const tiltEl = wrapper.firstElementChild as HTMLElement | null
        if (!tiltEl) return

        let rect = wrapper.getBoundingClientRect()

        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault()
            e.stopPropagation()
            isHovering.current = true
            rect = wrapper.getBoundingClientRect()
            tiltEl.style.transition = 'none'
        }

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault()
            e.stopPropagation()

            const touch = e.touches[0]
            const xPct = Math.max(-100, Math.min(100, ((touch.clientX - rect.left) / rect.width)  * 200 - 100))
            const yPct = Math.max(-100, Math.min(100, ((touch.clientY - rect.top)  / rect.height) * 200 - 100))

            const rotX =  (yPct / 100) * MAX_ANGLE
            const rotY = -(xPct / 100) * MAX_ANGLE

            tiltEl.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`

            const normX = (xPct + 100) / 2
            const normY = (yPct + 100) / 2

            const foil  = foilRef.current
            const sheen = sheenRef.current

            if (foil && foilEnabledRef.current) {
                const hue = normX * 2.4
                foil.style.background = `linear-gradient(
                    ${105 + rotY * 4}deg,
                    hsla(${hue},       100%, 65%, 0.25) 0%,
                    hsla(${hue + 60},  100%, 65%, 0.2)  25%,
                    hsla(${hue + 120}, 100%, 65%, 0.25) 50%,
                    hsla(${hue + 180}, 100%, 65%, 0.2)  75%,
                    hsla(${hue + 240}, 100%, 65%, 0.25) 100%
                )`
                foil.style.opacity = '1'
            }

            if (sheen && sheenEnabledRef.current) {
                sheen.style.background = `radial-gradient(circle at ${normX}% ${normY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)`
                sheen.style.opacity = '1'
            }
        }

        const onTouchEnd = () => {
            isHovering.current = false
            tiltEl.style.transition = 'all 1000ms cubic-bezier(.03,.98,.52,.99)'
            tiltEl.style.transform   = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
            resetOverlays()
        }

        wrapper.addEventListener('touchstart', onTouchStart, { passive: false })
        wrapper.addEventListener('touchmove',  onTouchMove,  { passive: false })
        wrapper.addEventListener('touchend',   onTouchEnd)

        return () => {
            wrapper.removeEventListener('touchstart', onTouchStart)
            wrapper.removeEventListener('touchmove',  onTouchMove)
            wrapper.removeEventListener('touchend',   onTouchEnd)
        }
    }, [])

    // Mouse path — handled by the library as before.
    const handleMove = ({ tiltAngleY, tiltAngleXPercentage, tiltAngleYPercentage }: { tiltAngleY: number, tiltAngleXPercentage: number, tiltAngleYPercentage: number }) => {
        const foil  = foilRef.current
        const sheen = sheenRef.current
        if (!foil || !sheen) return

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
            style={{ animation: 'float 5s ease-in-out infinite' }}
            onMouseLeave={handleLeave}
        >
        <Tilt
            tiltMaxAngleX={MAX_ANGLE}
            tiltMaxAngleY={MAX_ANGLE}
            scale={1.03}
            transitionSpeed={1000}
            onEnter={handleEnter}
            onMove={handleMove}
            onLeave={handleLeave}
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
