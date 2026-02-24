import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home').then(m => m.Home),
        title: 'Home — ClickDown',
      },
      {
        path: 'inbox',
        loadComponent: () => import('./features/inbox/inbox').then(m => m.InboxComponent),
        title: 'Inbox — ClickDown',
      },
      {
        path: 'my-work',
        loadComponent: () => import('./features/my-work/my-work').then(m => m.MyWorkComponent),
        title: 'My Work — ClickDown',
      },
      {
        path: 'space/:spaceId',
        loadComponent: () => import('./features/space/space').then(m => m.SpaceComponent),
      },
      {
        path: 'space/:spaceId/list/:listId',
        loadComponent: () => import('./features/space/space').then(m => m.SpaceComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
