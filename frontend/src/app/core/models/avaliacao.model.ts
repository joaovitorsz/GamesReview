export interface Avaliacao {
    id: number;
    avaliador: string;
    nota: number;
    comentario: string;
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