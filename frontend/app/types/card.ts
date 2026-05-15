export interface Card {
    id: number;
    name: string;
    description: string;
    imagePath: string;
    stats: {
        attack: number;
        defend: number;
        hp: number;
    };
}
