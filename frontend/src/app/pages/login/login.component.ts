import { ChangeDetectionStrategy, Component, inject, input, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import { email } from "@angular/forms/signals";
import { HttpErrorResponse } from "@angular/common/http";


@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: '../../app.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoginComponent{
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    volta = input<string | undefined>(undefined);

    carregando = signal(false);
    mensagemErro = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required]]
    });

    entrar(){
        this.mensagemErro.set(null);

        if(this.form.invalid){
            this.form.markAllAsTouched();
            this.mensagemErro.set('Preencha um e-mail válido e a senha para entrar.');
            return;
        }

        this.carregando.set(true);

        this.authService.login(this.form.getRawValue()).subscribe({
            next: () => {
                this.carregando.set(false);
                const destino = this.volta() || '/jogos';
                this.router.navigateByUrl(destino);
            },

            error: (err: HttpErrorResponse) => {
                this.carregando.set(false);
                if(err.status === 401){
                    this.mensagemErro.set('E-mail ou senha inválidos.');
                } else if (err.status === 0 || err.status >= 500){
                    this.mensagemErro.set('Não foi possível conectar ao servidor. Verifique se a API está sendo executada.');
                } else if (typeof err.error === 'string' && err.error.trim()){
                    this.mensagemErro.set(err.error);
                }
            }
        });
    }

}