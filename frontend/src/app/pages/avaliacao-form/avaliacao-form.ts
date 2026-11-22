import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/game.service';
import { AvaliacaoService } from '../../core/avaliacao.service';
import { Game } from '../../core/models/game.model';
import { HttpErrorResponse } from '@angular/common/http';

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
  private router = inject(Router);

  gameId = input<string | undefined>(undefined);

  jogos = signal<Game[]>([]);
  carregandoJogos = signal(false);
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
      this.form.patchValue({ gameId: idInicial});
    }

    this.carregarJogos();
  }

  private carregarJogos(){
    this.carregandoJogos.set(true);
    this.mensagemErro.set(null);

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

  salvar(){
    this.mensagemErro.set(null);

    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.mensagemErro.set('Preencha todos os campos corretamente (nota entre 0 e 10).');
      return;
    }

    const valores = this.form.getRawValue();
    const idJogo = Number(valores.gameId);

    if(Number.isNaN(idJogo) || idJogo <= 0){
      this.mensagemErro.set('Selecione um jogo válido.');
      return;
    }

    this.salvando.set(true);

    const payload = {
      avaliador: valores.avaliador.trim(),
      nota: Number(valores.nota),
      comentario: valores.comentario.trim()
    };

    this.avaliacaoService.gravar(idJogo, payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/jogos', idJogo]);
      },

      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);

        if(err.status === 401){
          this.mensagemErro.set('Sessão expirada. Faça login novamente para avaliar.');
        } else if(err.status === 403){
          this.mensagemErro.set('Seu perfil não tem permissão para registrar avaliações.');
        } else if(err.status === 404){
          this.mensagemErro.set('Jogo não encontrado na base de dados.');
        } else if(err.status === 400 && typeof err.error === 'string' && err.error.trim()){
          this.mensagemErro.set(err.error);
        } else if(err.status === 0 || err.status >= 500){
          this.mensagemErro.set('Não foi possível conectar ao servidor. Verifique se a API está sendo executada.');
        } else{
          this.mensagemErro.set('Não foi possível salvar a avaliação.');
        }
      }
    });
  }
}
