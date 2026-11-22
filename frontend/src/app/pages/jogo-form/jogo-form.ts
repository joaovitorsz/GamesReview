import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/game.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-jogo-form',
  styleUrls: ['../../app.css','./jogo-form.css'],
  templateUrl: './jogo-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class JogoForm implements OnInit{
  
  private fb = inject(FormBuilder);
  private gameService = inject(GameService);
  private router = inject(Router);
  
  id = input<string | undefined>(undefined);

  modoEdicao = computed(() => Boolean(this.id()));
  gameId = signal<number | null>(null);
  carregando = signal(false);
  salvando = signal(false);
  mensagemErro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    genero: ['', [Validators.required, Validators.minLength(2)]],
    metacritic: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    sinopse: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(){
    const idParam = this.id();
    if(!idParam) return;

    const idNumerico = Number(idParam);
    if(Number.isNaN(idNumerico)){
      this.mensagemErro.set('ID do jogo inválido.');
      return;
    }

    this.gameId.set(idNumerico);
    this.carregarJogo(idNumerico);
  }

  private carregarJogo(id: number){
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.gameService.buscarPorId(id).subscribe({
      next: (jogo) => {
        this.form.patchValue({
          titulo: jogo.titulo,
          genero: jogo.genero,
          metacritic: jogo.metacritic,
          sinopse: jogo.sinopse
        });
        this.carregando.set(false);
      },

        error: (err: Error) => {
          this.carregando.set(false);
          this.mensagemErro.set(err.message || 'Não foi possível carregar os dados do jogo.');
        }
    });
  }

  salvar(){
    this.mensagemErro.set(null);

    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.mensagemErro.set('Preencha todos os campos corretamente.');
      return;
    }

    this.salvando.set(true);
    const valores = this.form.getRawValue();
    const payload = {
      ...valores,
      metacritic: Number(valores.metacritic)
    };

    const idAtual = this.gameId();
    const requisicao$ = this.modoEdicao() && idAtual !== null
      ? this.gameService.editar(idAtual, payload)
      : this.gameService.criar(payload);

    requisicao$.subscribe({
      next: (jogoSalvo) => {
        this.salvando.set(false);
        const destinoId = jogoSalvo?.id ?? idAtual;
        
        if(destinoId){
          this.router.navigate(['/jogos', destinoId]);
        } else{
          this.router.navigate(['/jogos']);
        }
      },

      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);

        if(err.status === 401){
          this.mensagemErro.set('Sessão expirada. Faça login novamente para salvar.');
        } else if(err.status === 403){
          this.mensagemErro.set('Seu perfil não tem permissão para editar jogos.');
        } else if(err.status === 400 && typeof err.error === 'string' && err.error.trim()){
          this.mensagemErro.set(err.error);
        } else if(err.status === 0 || err.status >= 500){
          this.mensagemErro.set('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
        } else{
          this.mensagemErro.set('Não foi possível salvar o jogo.');
        }
      }
    });
  }
}
