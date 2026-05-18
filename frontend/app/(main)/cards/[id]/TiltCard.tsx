'use client'

import Image from "next/image"
import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface TiltCardProps {
    src: string
    alt: string
}

const MAX_ANGLE = 12
const SPRING    = { stiffness: 400, damping: 30 }

export const TiltCard = ({ src, alt }: TiltCardProps) => {
    const cardRef  = useRef<HTMLDivElement>(null)
    const holoRef  = useRef<HTMLDivElement>(null)
    const shineRef = useRef<HTMLDivElement>(null)

    const [holoEnabled,  setHoloEnabled]  = useState(true)
    const [shineEnabled, setShineEnabled] = useState(true)

    // Normalized position within the card (0–1). Springs animate smoothly
    // toward these values, giving natural tilt and snap-back on leave.
    const xRaw     = useMotionValue(0.5)
    const yRaw     = useMotionValue(0.5)
    const scaleRaw = useMotionValue(1)

    const xSpring = useSpring(xRaw,     SPRING)
    const ySpring = useSpring(yRaw,     SPRING)
    const scale   = useSpring(scaleRaw, SPRING)

    const rotateY = useTransform(xSpring, [0, 1], [-MAX_ANGLE,  MAX_ANGLE])
    const rotateX = useTransform(ySpring, [0, 1], [ MAX_ANGLE, -MAX_ANGLE])

    const resetCard = () => {
        xRaw.set(0.5)
        yRaw.set(0.5)
        scaleRaw.set(1)
        if (holoRef.current)  holoRef.current.style.opacity  = '0'
        if (shineRef.current) shineRef.current.style.opacity = '0'
    }

    const updateFromPointer = (clientX: number, clientY: number) => {
        const el = cardRef.current
        if (!el) return

        const rect = el.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (clientY - rect.top)  / rect.height))
        xRaw.set(x)
        yRaw.set(y)

        const xN    = x * 100
        const yN    = y * 100
        const angleY = (x - 0.5) * 2 * MAX_ANGLE

        if (holoRef.current && holoEnabled) {
            const hue = xN * 2.4
            holoRef.current.style.background = `linear-gradient(
                ${105 + angleY * 4}deg,
                hsla(${hue},       100%, 65%, 0.25) 0%,
                hsla(${hue + 60},  100%, 65%, 0.2)  25%,
                hsla(${hue + 120}, 100%, 65%, 0.25) 50%,
                hsla(${hue + 180}, 100%, 65%, 0.2)  75%,
                hsla(${hue + 240}, 100%, 65%, 0.25) 100%
            )`
            holoRef.current.style.opacity = '1'
        }

        if (shineRef.current && shineEnabled) {
            // Light source moves opposite to pointer — physically accurate specular highlight.
            shineRef.current.style.background = `radial-gradient(circle at ${100 - xN}% ${100 - yN}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)`
            shineRef.current.style.opacity = '1'
        }
    }

    // Mouse: tilt activates on hover, no click needed.
    const onPointerEnter = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse') scaleRaw.set(1.03)
    }

    // Touch: tilt activates on press. setPointerCapture routes all subsequent
    // pointer events to this element even if the finger slides past the edge.
    const onPointerDown = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') {
            e.currentTarget.setPointerCapture(e.pointerId)
            scaleRaw.set(1.03)
        }
    }

    // Shared move handler for mouse and touch. React's onPointerMove is
    // non-passive — unlike onTouchMove — so preventDefault() works here.
    const onPointerMove = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') e.preventDefault()
        updateFromPointer(e.clientX, e.clientY)
    }

    const onPointerLeave = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse') resetCard()
    }

    const onPointerUp = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') resetCard()
    }

    return (
        <div style={{ animation: 'float 5s ease-in-out infinite' }}>
            <motion.div
                ref={cardRef}
                style={{
                    rotateX,
                    rotateY,
                    scale,
                    transformPerspective: 1000,
                    touchAction: 'none',
                    userSelect: 'none',
                }}
                onPointerEnter={onPointerEnter}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                onPointerCancel={resetCard}
            >
                <div className="relative overflow-hidden shadow-2xl border border-white/20 rounded-lg p-4">
                    <Image
                        src={src}
                        alt={alt}
                        width={400}
                        height={560}
                        style={{ width: '100%', height: 'auto' }}
                        loading="eager"
                    />
                    <div
                        ref={holoRef}
                        className="absolute inset-0 pointer-events-none mix-blend-color-dodge"
                        style={{ opacity: 0, transition: 'opacity 0.3s ease', borderRadius: 'inherit' }}
                    />
                    <div
                        ref={shineRef}
                        className="absolute inset-0 pointer-events-none mix-blend-screen"
                        style={{ opacity: 0, transition: 'opacity 0.2s ease', borderRadius: 'inherit' }}
                    />

                    {/* Toggles — pinned to bottom of card */}
                    <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                        {[
                            { label: 'Holo',  enabled: holoEnabled,  toggle: () => setHoloEnabled(v => !v)  },
                            { label: 'Shine', enabled: shineEnabled, toggle: () => setShineEnabled(v => !v) },
                        ].map(({ label, enabled, toggle }) => (
                            <button
                                key={label}
                                onClick={toggle}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-widest transition-all"
                                style={{
                                    background:    enabled ? 'rgba(0,0,0,0.6)'         : 'rgba(0,0,0,0.35)',
                                    border:        `1px solid ${enabled ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                    color:         enabled ? 'rgba(255,255,255,0.9)'   : 'rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(6px)',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
