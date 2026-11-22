export interface Avaliacao {
    id: number;
    avaliador: string;
    nota: number;
    comentario: string;
    gameId?: number | null;
    autorEmail?: string | null;
}

export interface AvaliacaoRequest {
    avaliador: string;
    nota: number;
    comentario: string;
}

export interface AvaliacaoUpdate {
    nota?: number;
    comentario?: string;
}