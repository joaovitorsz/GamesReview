import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'jogos',
        pathMatch: 'full'
    },

    {
        path: 'login',
        loadComponent: () => import ('./pages/login/login').then((m) => m.Login)
    },

    {
        path: 'registro',
        loadComponent: () => import ('./pages/registro/registro').then((m) => m.Registro)
    },

    {
        path: 'jogos',
        loadComponent: () => import ('./pages/jogos-lista/jogos-lista').then((m) => m.JogosLista) 
    },

    {
        path: 'jogos/novo',
        canActivate: [authGuard],
        loadComponent: () => import ('./pages/jogo-form/jogo-form').then((m) => m.JogoForm)
    },

    {
        path: 'jogos/:id/editar',
        canActivate: [adminGuard],
        loadComponent: () => import ('./pages/jogo-form/jogo-form').then((m) => m.JogoForm)
    },

    {
        path: 'jogos/:id',
        loadComponent: () => import ('./pages/jogo-detalhe/jogo-detalhe').then((m) => m.JogoDetalhe)
    },

    {
        path: 'avaliacoes/nova',
        canActivate: [authGuard],
        loadComponent: () => import ('./pages/avaliacao-form/avaliacao-form').then((m) => m.AvaliacaoForm)
    },

    {
        path: 'avaliacoes/:id/editar',
        canActivate: [authGuard],
        loadComponent: () => import ('./pages/avaliacao-form/avaliacao-form').then((m) => m.AvaliacaoForm)
    },

    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil)
    },

    {
        path: '**',
        redirectTo: 'jogos'
    }
];
