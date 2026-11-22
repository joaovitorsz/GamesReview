import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, retry, throwError } from "rxjs";
import { Game, GameRequest } from "./models/game.model";
import { environment } from "../../environments/environment";


export interface FiltroJogos {
    titulo?: string;
    genero?: string;
    metacritic?: number | null;
}

@Injectable({providedIn: 'root'})
export class GameService{
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/game/review`;

    listar(filtros?: FiltroJogos){
        let params = new HttpParams();

        if(filtros?.titulo?.trim()){
            params = params.set('titulo', filtros.titulo.trim());
        }

        if(filtros?.genero?.trim()){
            params = params.set('genero', filtros.genero.trim());
        }

        if(filtros?.metacritic !== null && filtros?.metacritic !== undefined){
            params = params.set('metacritic', String(filtros.metacritic));
        }

        return this.http.get<Game[]>(`${this.baseUrl}/listar-jogos`, {params}).pipe(
            retry(1),
            catchError((erro: HttpErrorResponse) => {
                console.error('Erro ao listar jogos:', erro.status, erro.message);

                return throwError(() => new Error('Não foi possível carregar os jogos.'));
            })
        );
    }

    buscarPorId(id: number | string){
        return this.http.get<Game>(`${this.baseUrl}/id/${id}`).pipe(
            retry(1),
            catchError((erro: HttpErrorResponse) => {
                console.error('Erro ao buscar jogo por ID:', erro.status, erro.message);
                const msg = erro.status === 404
                  ? 'Jogo não encontrado.'
                  : 'Não foi possível carregar os detalhes do jogo.';
                return throwError(() => new Error(msg));
            })
        );
    }

    criar(dados: GameRequest) {
        return this.http.post<Game>(`${this.baseUrl}/gravar-jogo`, dados);
    }

    editar(gameId: number, dados: Partial<GameRequest>) {
        return this.http.put<Game>(`${this.baseUrl}/editar-jogo/${gameId}`, dados);
    }

    deletar(gameId: number) {
        return this.http.delete(`${this.baseUrl}/deletar-jogo/${gameId}`, {
            responseType: 'text'
        });
    }

}