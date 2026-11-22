import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'jogos',
        pathMatch: 'full'
    },

    {
        path: 'login',
        loadComponent: () => import ('./pages/login/login.component').then((m) => m.LoginComponent)
    },

    {
        path: 'registro',
        loadComponent: () => import ('./pages/registro/registro.component').then((m) => m.RegistroComponent)
    },

    {
        path: 'jogos',
        loadComponent: () => import ('./pages/jogos-lista/jogos-lista.component').then((m) => m.JogosListaComponent) 
    },

    /*{
        path: 'jogos/novo',
        canActivate: [authGuard],
        loadComponent: () => import ('./pages/jogo-form/jogo-form.component').then((m) => m.JogoFormComponent)
    },

    {
        path: 'jogos/:id/editar',
        canActivate: [authGuard],
        loadComponent: () => import ('./pages/jogo-form/jogo-form.component').then((m) => m.JogoFormComponent)
    },

    {
        path: 'jogos/:id',
        loadComponent: () => import ('./pages/jogo-detalhe/jogo-detalhe.component').then((m) => m.JogoDetalheComponent)
    },

    {
        path: 'avaliacoes/nova',
        canActivate: [authGuard],
        loadComponent: () => import ('./pages/avaliacao-form/avaliacao-form.component').then((m) => m.AvaliacaoFormComponent)
    },*/

    {
        path: '**',
        redirectTo: 'jogos'
    }
];
