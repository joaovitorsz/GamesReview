import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameService } from '../../core/game.service';
import { AvaliacaoService } from '../../core/avaliacao.service';
import { AuthService } from '../../core/auth.service';
import { Avaliacao } from '../../core/models/avaliacao.model';
import { Game } from '../../core/models/game.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [RouterLink],
  selector: 'app-jogo-detalhe',
  styleUrls: ['../../app.css', './jogo-detalhe.css'],
  templateUrl: './jogo-detalhe.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class JogoDetalhe implements OnInit {
  private gameService = inject(GameService);
  private avaliacaoService = inject(AvaliacaoService);
  protected auth = inject(AuthService);

  id = input.required<string>();

  jogo = signal<Game | null>(null);
  avaliacoes = signal<Avaliacao[]>([]);
  carregandoJogo = signal(false);
  carregandoAvaliacoes = signal(false);
  excluindoAvaliacaoId = signal<number | null>(null);
  mensagemErro = signal<string | null>(null);
  mensagemSucesso = signal<string | null>(null);

  ngOnInit() {
    const gameId = Number(this.id());

    if(Number.isNaN(gameId)){
      this.mensagemErro.set('ID do jogo inválido.');
      return;
    }

    this.carregarJogo(gameId);
    this.carregarAvaliacoes(gameId);
  }

  podeEditarAvaliacao(av: Avaliacao): boolean{
    const emailLogado = this.auth.usuario()?.email;
    return Boolean(emailLogado && av.autorEmail && av.autorEmail === emailLogado);
  }

  podeDeletarAvaliacao(av: Avaliacao): boolean{
    return this.auth.isAdmin() || this.podeEditarAvaliacao(av);
  }

  excluirAvaliacao(av: Avaliacao){
    if(!confirm('Deseja realmente excluir essa avaliação?')){
      return;
    }

    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
    this.excluindoAvaliacaoId.set(av.id);

    this.avaliacaoService.deletar(av.id).subscribe({
      next: () => {
        this.excluindoAvaliacaoId.set(null);
        this.avaliacoes.update((lista) => lista.filter((item) => item.id !== av.id));
        this.mensagemSucesso.set('Avaliação removida com sucesso.');
      },

      error: (err: HttpErrorResponse) => {
        this.excluindoAvaliacaoId.set(null);

        if(err.status === 401){
          this.mensagemErro.set('Sessão expirada. Faça login novamente.');
        } else if(err.status === 403){
          this.mensagemErro.set('Você não possui permissão para excluir esta avaliação.');
        } else if(err.status === 404){
          this.mensagemErro.set('Avaliação não encontrada.');
        } else{
          this.mensagemErro.set('Não foi possível excluir a avaliação.');
        }
      }
    });
  }

  private carregarJogo(gameId: number){
    this.carregandoJogo.set(true);
    this.mensagemErro.set(null);

    this.gameService.buscarPorId(gameId).subscribe({
      next: (dados) => {
        this.jogo.set(dados);
        this.carregandoJogo.set(false);
      },

      error: (err: Error) => {
        this.carregandoJogo.set(false);
        this.mensagemErro.set(err.message || 'Não foi possível carregar os detalhes do jogo.');
      }
    });
  }

  private carregarAvaliacoes(gameId: number){
    this.carregandoAvaliacoes.set(true);

    this.avaliacaoService.listarPorJogo(gameId).subscribe({
      next: (lista) => {
        this.avaliacoes.set(lista);
        this.carregandoAvaliacoes.set(false);
      },

      error: () => {
        this.carregandoAvaliacoes.set(false);
        this.avaliacoes.set([]);
      }
    });
  }

}
