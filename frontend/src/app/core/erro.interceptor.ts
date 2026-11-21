import { inject } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "./auth.service";
import { catchError, throwError } from "rxjs";
import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";


export const erroInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((erro: HttpErrorResponse) => {
            if(erro.status === 401 && !req.url.includes('/auth/login')) {
                authService.logout(false);
                router.navigate(['/login']);
            }

            if(erro.status === 0 || erro.status >= 500) {
                console.error('Erro de comunicação com o servidor:', erro.status, erro.message);
            }

            return throwError(() => erro);
        })
    )
}