import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { GameService } from "../../core/game.service";
import { AuthService } from "../../core/auth.service";
import { Game } from "../../core/models/game.model";
import { HttpErrorResponse } from "@angular/common/http";


@Component({
    selector: 'app-jogos-lista',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './jogos-lista.component.html',
    styleUrl: '../../app.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class JogosListaComponent implements OnInit{
    private fb = inject(FormBuilder);
    private gameService = inject(GameService);
    protected auth = inject(AuthService);

    jogos = signal<Game[]>([]);
    carregando = signal(false);
    mensagemErro = signal<string | null>(null);
    mensagemSucesso = signal<string | null>(null);
    excluindoId = signal<number | null>(null);

    filtroForm = this.fb.group({
        titulo: [''],
        genero: [''],
        metacritic: [null as number | null]
    });

    ngOnInit() {
        this.buscarJogos();
    }

    buscarJogos(){
        this.mensagemErro.set(null);
        this.carregando.set(true);

        const valores = this.filtroForm.getRawValue();

        this.gameService
            .listar({
                titulo: valores.titulo ?? undefined,
                genero: valores.genero ?? undefined,
                metacritic: valores.metacritic
            })
            
            .subscribe({
                next: (lista) => {
                    this.jogos.set(lista);
                    this.carregando.set(false);
                },
                
                error: (err: Error) => {
                    this.carregando.set(false);
                    this.mensagemErro.set(err.message || 'Erro ao carregar o catálogo de jogos.');
                }
            });
    }

    limparFiltros(){
        this.filtroForm.reset({
            titulo: '',
            genero: '',
            metacritic: null
        });
        this.buscarJogos();
    }

    excluirJogo(jogo: Game){
        const confirmou = window.confirm(`Deseja realmente excluir "${jogo.titulo}"?`);
        if(!confirmou) return;

        this.mensagemErro.set(null);
        this.mensagemSucesso.set(null);
        this.excluindoId.set(jogo.id);
        
        this.gameService.deletar(jogo.id).subscribe({
            next: (resposta) => {
                this.excluindoId.set(null);
                this.jogos.update((listaAtual) => listaAtual.filter((item) => item.id !== jogo.id));
                this.mensagemSucesso.set(resposta || `Jogo "${jogo.titulo}" removido com sucesso.`);
            },

            error: (err: HttpErrorResponse) => {
                this.excluindoId.set(null);
                if(err.status === 403) {
                    this.mensagemErro.set('Seu perfil não tem permissão para excluir jogos.');
                } else if(err.status === 401) {
                    this.mensagemErro.set('Faça login novamente para excluir o jogo.');
                } else {
                    this.mensagemErro.set('Não foi possível excluir o jogo.');
                }
            }
        });

    }

}