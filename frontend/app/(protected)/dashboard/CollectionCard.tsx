'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/app/types/card'

interface Props {
    userCardId: number
    card: Card
}

export const CollectionCard = ({ userCardId, card }: Props) => (
    <Link
        key={userCardId}
        href={`/cards/${card.id}`}
        className="group flex flex-col gap-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50 hover:translate-y-[-6px] transition-all duration-300"
    >
        <div className="relative">
            <Image
                src={card.imagePath}
                alt={card.name}
                width={400}
                height={560}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                loading="eager"
            />
            {/* Shader overlay — fades out on hover */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)' }}
            />
        </div>
    </Link>
)
