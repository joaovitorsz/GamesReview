import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/game.service';
import { AvaliacaoService } from '../../core/avaliacao.service';
import { Game } from '../../core/models/game.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-avaliacao-form',
  styleUrls: ['../../app.css', './avaliacao-form.css'],
  templateUrl: './avaliacao-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AvaliacaoForm implements OnInit{

  private fb = inject(FormBuilder);
  private gameService = inject(GameService);
  private avaliacaoService = inject(AvaliacaoService);
  private auth = inject(AuthService);
  private router = inject(Router);

  id = input<string | undefined>(undefined);
  gameId = input<string | undefined>(undefined);

  modoEdicao = computed(() => Boolean(this.id()));
  gameIdDestino = signal<string | null>(null);

  voltarLink = computed(() => {
    const destino = this.gameIdDestino() ?? this.gameId();
    return destino ? ['/jogos', destino] : ['/jogos'];
  });

  jogos = signal<Game[]>([]);
  carregandoJogos = signal(false);
  carregandoAvaliacao = signal(false);
  semPermissaoEdicao = signal(false);
  salvando = signal(false);
  mensagemErro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    gameId: ['', [Validators.required]],
    avaliador: ['', [Validators.required, Validators.minLength(3)]],
    nota: [10, [Validators.required, Validators.min(0), Validators.max(10)]],
    comentario: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(){
    const idInicial = this.gameId();
    if(idInicial){
      this.gameIdDestino.set(idInicial);
      this.form.patchValue({ gameId: idInicial});
    }

    this.carregarJogos();

    if(this.modoEdicao()){
      const idAvaliacao = Number(this.id());
      if(Number.isNaN(idAvaliacao)){
        this.mensagemErro.set('ID da avaliação inválido.');
        this.semPermissaoEdicao.set(true);
        return;
      }

      this.carregarAvaliacao(idAvaliacao);
    } else{
      const nomeUsuario = this.auth.usuario()?.nome;
      if(nomeUsuario){
        this.form.patchValue({avaliador: nomeUsuario});
      }
    }
  }

  private carregarJogos(){
    this.carregandoJogos.set(true);

    this.gameService.listar().subscribe({
      next: (lista) => {
        this.jogos.set(lista);
        this.carregandoJogos.set(false);
      },

      error: (err: Error) => {
        this.carregandoJogos.set(false);
        this.mensagemErro.set(err.message || 'Não foi possível carregar a lista de jogos.');
      }
    });
  }

  private carregarAvaliacao(idAvaliacao: number){
    this.carregandoAvaliacao.set(true);
    this.mensagemErro.set(null);

    this.avaliacaoService.buscarPorId(idAvaliacao).subscribe({
      next: (av) => {
        this.carregandoAvaliacao.set(false);

        if(av.gameId){
          this.gameIdDestino.set(String(av.gameId));
        }

        const emailLogado = this.auth.usuario()?.email;
        if(!av.autorEmail || av.autorEmail !== emailLogado){
          this.semPermissaoEdicao.set(true);
          this.mensagemErro.set('Você só pode editar suas próprias avaliações.');
          return;
        }

        this.form.patchValue({
          gameId: av.gameId ? String(av.gameId) : (this.gameId() ?? ''),
          avaliador: av.avaliador,
          nota: av.nota,
          comentario: av.comentario
        });

        this.form.controls.gameId.disable();
        this.form.controls.avaliador.disable();
      },

      error: (err: Error) => {
        this.carregandoAvaliacao.set(false);
        this.semPermissaoEdicao.set(true);
        this.mensagemErro.set(err.message || 'Não foi possível carregar a avaliação.');
      }
    });
  }

  salvar(){
    this.mensagemErro.set(null);

    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.mensagemErro.set('Preencha todos os campos corretamente (nota entre 0 e 10).');
      return;
    }

    const valores = this.form.getRawValue();
    this.salvando.set(true);

    if(this.modoEdicao()){
      const idAvaliacao = Number(this.id());
      const payloadEdicao = {
        nota: Number(valores.nota),
        comentario: valores.comentario.trim()
      };

      this.avaliacaoService.editar(idAvaliacao, payloadEdicao).subscribe({
        next: (atualizada) => {
          this.salvando.set(false);
          const destino = atualizada.gameId ?? this.gameIdDestino() ?? this.gameId();
          this.router.navigate(destino ? ['/jogos', destino] : ['/jogos']); 
        },

        error: (err: HttpErrorResponse) => this.tratarErroSalvar(err)
      });

      return;
    }

    const idJogo = Number(valores.gameId);
    if(Number.isNaN(idJogo) || idJogo <= 0){
      this.salvando.set(false);
      this.mensagemErro.set('Selecione um jogo válido.');
      return;
    }

    const payloadCriacao = {
      avaliador: valores.avaliador.trim(),
      nota: Number(valores.nota),
      comentario: valores.comentario.trim()
    };

    this.avaliacaoService.gravar(idJogo, payloadCriacao).subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/jogos', idJogo]);
      },

      error: (err: HttpErrorResponse) => this.tratarErroSalvar(err)
    });
  }
  
  private tratarErroSalvar(err: HttpErrorResponse){
    this.salvando.set(false);

    if(err.status === 401){
      this.mensagemErro.set('Sessão expirada. Faça login novamente para salvar.');
    } else if(err.status === 403){
      this.mensagemErro.set('Você não possui permissão para realizar esta ação.');
    } else if(err.status === 404){
      this.mensagemErro.set(this.modoEdicao()? 'Avaliação não encontrada.' : 'Jogo não encontrado na base de dados.');
    } else if(err.status === 400 && typeof err.error === 'string' && err.error.trim()){
      this.mensagemErro.set(err.error);
    } else if(err.status === 0 || err.status >= 500){
      this.mensagemErro.set('Não foi possível conectar ao servidor. Verifique se a API está sendo executada.');
    } else{
      this.mensagemErro.set('Não foi possível salvar a avaliação.');
    }
  }
  
}
