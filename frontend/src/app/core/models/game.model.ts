export interface Game {
    id: number;
    titulo: string;
    genero: string;
    metacritic: number;
    sinopse: string;
}

export interface GameRequest {
    titulo: string;
    genero: string;
    metacritic: number;
    sinopse: number;
}