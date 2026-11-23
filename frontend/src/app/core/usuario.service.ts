import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { tap } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthResponse, UsuarioUpdate } from "./models/auth.model";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private baseUrl = `${environment.apiUrl}/usuarios`;

    meuPerfil() {
        return this.http.get<AuthResponse>(`${this.baseUrl}/me`);
    }

    editarPerfil(dados: UsuarioUpdate) {
        return this.http.put<AuthResponse>(`${this.baseUrl}/me`, dados).pipe(
            tap((resposta) => this.authService.atualizarSessao(resposta))
        );
    }

    deletarConta() {
        return this.http.delete(`${this.baseUrl}/me`, {
            responseType: 'text'
        });
    }
}