export type Role = 'USER' | 'ADMIN';

export interface AuthResponse {
    token: string | null;
    nome: string;
    email: string;
    role: Role;
}

export interface LoginRequest {
    email: string;
    senha: string;
}

export interface RegistroRequest {
    nome: string;
    email: string;
    senha: string;
    role?: Role;
}

export interface UsuarioUpdate {
    nome?: string;
    email?: string;
    senha?: string;
}