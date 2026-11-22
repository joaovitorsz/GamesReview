import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AuthResponse, LoginRequest, RegistroRequest } from "./models/auth.model";
import { tap } from "rxjs";
import { environment } from "../../environments/environment";

const STORAGE_KEY = 'gamesreview_auth';

@Injectable({providedIn: 'root'})
export class AuthService {
    
    private http = inject(HttpClient);
    private router = inject(Router);
    private authUrl = `${environment.apiUrl}/auth`;

    private sessaoSignal = signal<AuthResponse | null>(this.lerSessaoInicial());

    usuario = this.sessaoSignal.asReadonly();
    token = computed(() => this.sessaoSignal()?.token ?? null);
    estaLogado = computed(() => Boolean(this.token()));
    isAdmin = computed(() => this.sessaoSignal()?.role === 'ADMIN');

    login(dados: LoginRequest){
        return this.http.post<AuthResponse>(`${this.authUrl}/login`, dados).pipe(
            tap((resposta) => this.salvarSessao(resposta))
        );
    }

    registrar(dados: RegistroRequest){
        return this.http.post<AuthResponse>(`${this.authUrl}/register`, dados).pipe(
            tap((resposta) => this.salvarSessao(resposta))
        )
    }

    logout(redirecionar = true){
        localStorage.removeItem(STORAGE_KEY);
        this.sessaoSignal.set(null);
        
        if (redirecionar) {
            this.router.navigate(['/login']);
        }
    }

    private salvarSessao(resposta: AuthResponse){
        const sessaoAtual = this.sessaoSignal();
        const sessaoFinal: AuthResponse = {
            ...resposta,
            token: resposta.token ?? sessaoAtual?.token ?? null
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessaoFinal));
        this.sessaoSignal.set(sessaoFinal);
    }

    private lerSessaoInicial(): AuthResponse | null{
        try{
            const bruto = localStorage.getItem(STORAGE_KEY);
            if(!bruto)
                return null;

            const parsed = JSON.parse(bruto) as AuthResponse;
            return parsed?.token ? parsed: null;
        } catch {
            return null;
        }
    }
}