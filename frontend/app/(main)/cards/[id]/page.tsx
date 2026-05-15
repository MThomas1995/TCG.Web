
import { Card } from "@/app/types/card"
import Image from "next/image"
import { env } from "@/app/env"

/**
 * Card page component
 * @param param - The parameters for the card page
 * @returns The card page
 */
const CardPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params

    const response = await fetch(`${env.NEXT_PUBLIC_TCG_API_URL}/cards/${id}`)
    const card: Card = await response.json()

    return (
        <>
            <h1>Card Page</h1>
            <p>Card ID: {id}</p>
            <p>Card Name: {card.name}</p>
            <p>Card Description: {card.description}</p>
            <Image
                src={`${env.NEXT_PUBLIC_TCG_API_URL}${card.imagePath}`}
                alt={card.name}
                width={200}
                height={200}
                style={{ width: 'auto' }}
                loading="eager"
            />
            <ul>
                <li>Attack: {card.stats.attack}</li>
                <li>Defend: {card.stats.defend}</li>
                <li>HP: {card.stats.hp}</li>
            </ul>
        </>
    )
}

export default CardPage
