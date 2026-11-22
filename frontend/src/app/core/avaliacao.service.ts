import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Avaliacao, AvaliacaoRequest, AvaliacaoUpdate } from "./models/avaliacao.model";
import { catchError, retry, throwError } from "rxjs";


@Injectable({providedIn: 'root'})
export class AvaliacaoService{
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/game/review`;

    listarPorJogo(gameId: number | string){
        return this.http.get<Avaliacao[]>(`${this.baseUrl}/listar-avaliacoes/${gameId}`).pipe(
            retry(1),
            catchError((erro: HttpErrorResponse) => {
                console.error('Erro ao listar avaliações:', erro.status, erro.message);
                const msg = erro.status === 404
                  ? 'Avaliações não encontradas para este jogo.'
                  : 'Não foi possível carregar as avaliações.';

                return throwError(() => new Error(msg));
            })
        );
    }

    buscarPorId(idAvaliacao: number | string){
        return this.http.get<Avaliacao>(`${this.baseUrl}/avaliacao/${idAvaliacao}`).pipe(
            retry(1),
            catchError((erro: HttpErrorResponse) => {
                console.error('Erro ao buscar avaliação por ID:', erro.status, erro.message);
                const msg = erro.status === 404
                  ? 'Avaliação não encontrada.'
                  : 'Não foi possível carregar os dados da avaliação.';
                  return throwError(() => new Error(msg));
            })
        );
    }

    gravar(gameId: number, dados: AvaliacaoRequest){
        return this.http.post<Avaliacao>(`${this.baseUrl}/gravar-avaliacao/${gameId}`, dados);
    }

    editar(idAvaliacao: number, dados: AvaliacaoUpdate){
        return this.http.put<Avaliacao>(`${this.baseUrl}/editar-avaliacao/${idAvaliacao}`, dados);
    }

    deletar(idAvaliacao: number){
        return this.http.delete(`${this.baseUrl}/deletar-avaliacao/${idAvaliacao}`, {
            responseType: 'text'
        });
    }

}