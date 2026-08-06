import { Routes } from '@angular/router';
import { PublicLayout } from './core/layouts/public-layout/public-layout';
import { AdminLayout } from './core/layouts/admin-layout/admin-layout';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home').then(m => m.Home),
        title: 'Accueil | Sourire Pour Tous'
      },
      {
        path: 'actualites',
        loadComponent: () => import('./features/public/news/news-list/news-list').then(m => m.NewsList),
        title: 'Actualités | Sourire Pour Tous'
      },
      {
        path: 'actualites/:slug',
        loadComponent: () => import('./features/public/news/news-detail/news-detail').then(m => m.NewsDetail),
        title: 'Actualités | Sourire Pour Tous'
      },
      {
        path: 'a-propos',
        loadComponent: () => import('./features/public/about/about/about').then(m => m.About),
        title: 'À Propos | Sourire Pour Tous'
      },
      {
        path: 'actions',
        loadComponent: () => import('./features/public/actions/actions-page/actions-page').then(m => m.ActionsPage),
        title: 'Nos Actions | Sourire Pour Tous'
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/public/contact/contact-page/contact-page').then(m => m.ContactPage),
        title: 'Contact | Sourire Pour Tous'
      },
      {
        path: 'don',
        loadComponent: () => import('./features/public/donate/donate-page').then(m => m.DonatePage),
        title: 'Faire un don | Sourire Pour Tous'
      }
    ]
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login').then(m => m.Login)
  },
  {
    path: 'admin/update-password',
    loadComponent: () => import('./features/admin/update-password/update-password').then(m => m.UpdatePassword)
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'pages',
        loadComponent: () => import('./features/admin/pages-manager/pages-manager').then(m => m.PagesManager)
      },
      {
        path: 'articles',
        loadComponent: () => import('./features/admin/articles-manager/articles-manager').then(m => m.ArticlesManager)
      },
      {
        path: 'testimonials',
        loadComponent: () => import('./features/admin/testimonials-manager/testimonials-manager').then(m => m.TestimonialsManager)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings-manager/settings-manager').then(m => m.SettingsManager)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/admin/messages-manager/messages-manager').then(m => m.MessagesManager)
      },
      {
        path: 'team',
        loadComponent: () => import('./features/admin/team-manager/team-manager').then(m => m.TeamManager)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable | Sourire Pour Tous'
  }
];
