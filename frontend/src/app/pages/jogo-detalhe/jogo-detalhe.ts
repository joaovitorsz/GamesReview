import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameService } from '../../core/game.service';
import { AvaliacaoService } from '../../core/avaliacao.service';
import { AuthService } from '../../core/auth.service';
import { Avaliacao } from '../../core/models/avaliacao.model';
import { Game } from '../../core/models/game.model';

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
  mensagemErro = signal<string | null>(null);

  ngOnInit() {
    const gameId = Number(this.id());

    if(Number.isNaN(gameId)){
      this.mensagemErro.set('ID do jogo inválido.');
      return;
    }

    this.carregarJogo(gameId);
    this.carregarAvaliacoes(gameId);
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
