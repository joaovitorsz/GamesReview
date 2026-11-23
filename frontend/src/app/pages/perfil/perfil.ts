import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { UsuarioService } from '../../core/usuario.service';
import { UsuarioUpdate } from '../../core/models/auth.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-perfil',
  styleUrls: ['../../app.css', './perfil.css'],
  templateUrl: './perfil.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  protected auth = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  carregando = signal(false);
  salvando = signal(false);
  excluindo = signal(false);
  mensagemErro = signal<string | null>(null);
  mensagemSucesso = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
    confirmarSenha: ['']
  });

  ngOnInit() {
    this.carregarPerfil();
  }

  private carregarPerfil() {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.usuarioService.meuPerfil().subscribe({
      next: (dados) => {
        this.carregando.set(false);
        this.form.patchValue({
          nome: dados.nome,
          email: dados.email
        });
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);

        const usuarioLocal = this.auth.usuario();
        if (usuarioLocal) {
          this.form.patchValue({
            nome: usuarioLocal.nome,
            email: usuarioLocal.email
          });
        }

        if (err.status === 401) {
          this.mensagemErro.set('Sessão expirada. Faça login novamente.');
        } else {
          this.mensagemErro.set('Não foi possível sincronizar os dados do perfil.');
        }
      }
    });
  }

  salvar() {
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensagemErro.set('Preencha nome e e-mail válidos.');
      return;
    }

    const { nome, email, senha, confirmarSenha } = this.form.getRawValue();
    const senhaLimpa = senha.trim();

    if (senhaLimpa) {
      if (senhaLimpa.length < 6) {
        this.mensagemErro.set('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (senhaLimpa !== confirmarSenha.trim()) {
        this.mensagemErro.set('As senhas informadas não coincidem.');
        return;
      }
    }

    const payload: UsuarioUpdate = {
      nome: nome.trim(),
      email: email.trim()
    };

    if (senhaLimpa) {
      payload.senha = senhaLimpa;
    }

    this.salvando.set(true);

    this.usuarioService.editarPerfil(payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.form.patchValue({ senha: '', confirmarSenha: '' });
        this.mensagemSucesso.set('Perfil atualizado com sucesso!');
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);

        if (err.status === 401) {
          this.mensagemErro.set('Sessão expirada. Faça login novamente.');
        } else if (err.status === 400 && typeof err.error === 'string' && err.error.trim()) {
          this.mensagemErro.set(err.error);
        } else if (err.status === 0 || err.status >= 500) {
          this.mensagemErro.set('Não foi possível conectar ao servidor.');
        } else {
          this.mensagemErro.set('Não foi possível atualizar o perfil.');
        }
      }
    });
  }

  excluirConta() {
    const confirmacao = confirm(
      'Tem certeza que deseja excluir sua conta permanentemente? Essa ação não pode ser desfeita.'
    );
    if (!confirmacao) {
      return;
    }

    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
    this.excluindo.set(true);

    this.usuarioService.deletarConta().subscribe({
      next: () => {
        this.excluindo.set(false);
        this.auth.logout();
        this.router.navigate(['/jogos']);
      },
      error: (err: HttpErrorResponse) => {
        this.excluindo.set(false);

        if (err.status === 401) {
          this.mensagemErro.set('Sessão expirada. Faça login novamente.');
        } else {
          this.mensagemErro.set('Não foi possível excluir sua conta no momento.');
        }
      }
    });
  }
}