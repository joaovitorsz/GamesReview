import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";


export const authGuard: CanActivateFn = (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if(authService.estaLogado()){
        return true;
    }

    return router.createUrlTree(['/login'], {
        queryParams: {volta: state.url}
    });
}

export const adminGuard: CanActivateFn = (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if(authService.isAdmin()){
        return true;
    }

    if(!authService.estaLogado()){
        return router.createUrlTree(['/login'], {
            queryParams: {volta: state.url}
        });
    }

    return router.createUrlTree(['/jogos']);
}