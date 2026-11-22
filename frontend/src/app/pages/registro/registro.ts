import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import { Role } from "../../core/models/auth.model";
import { HttpErrorResponse } from "@angular/common/http";


@Component({
    imports: [ReactiveFormsModule, RouterLink],
    selector: 'app-registro',
    templateUrl: './registro.html',
    styleUrls: ['../../app.css', './registro.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class Registro {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    carregando = signal(false);
    mensagemErro = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        nome: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required, Validators.minLength(4)]],
        role: ['USER' as Role]
    });

    cadastrar(){
        this.mensagemErro.set(null);

        if(this.form.invalid){
            this.form.markAllAsTouched();
            this.mensagemErro.set('Preencha o nome, e-mail e senha (mínimo 4 caracteres)');
            return;
        }

        this.carregando.set(true);

        this.authService.registrar(this.form.getRawValue()).subscribe({
            next: () => {
                this.carregando.set(false);
                this.router.navigate(['/jogos']);
            },

            error: (err: HttpErrorResponse) => {
                this.carregando.set(false);
                if(err.status === 400 && typeof err.error === 'string'){
                    this.mensagemErro.set(err.error);
                } else if(err.status ===0 || err.status >= 500){
                    this.mensagemErro.set('Não foi possível conectar ao servidor. Verifique se a API está sendo executada.');
                } else{
                    this.mensagemErro.set('Erro ao cadastrar usuário.');
                }
            }
        });
    }
}