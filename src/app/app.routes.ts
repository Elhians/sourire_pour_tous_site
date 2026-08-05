import { Routes } from '@angular/router';
import { PublicLayout } from './core/layouts/public-layout/public-layout';
import { AdminLayout } from './core/layouts/admin-layout/admin-layout';
import { authGuard } from './core/guards/auth.guard';
import { Home } from './features/public/home/home';
import { NewsList } from './features/public/news/news-list/news-list';
import { NewsDetail } from './features/public/news/news-detail/news-detail';
import { About } from './features/public/about/about/about';
import { ActionsPage } from './features/public/actions/actions-page/actions-page';
import { ContactPage } from './features/public/contact/contact-page/contact-page';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Login } from './features/admin/login/login';
import { UpdatePassword } from './features/admin/update-password/update-password';
import { PagesManager } from './features/admin/pages-manager/pages-manager';
import { ArticlesManager } from './features/admin/articles-manager/articles-manager';
import { TestimonialsManager } from './features/admin/testimonials-manager/testimonials-manager';
import { MessagesManager } from './features/admin/messages-manager/messages-manager';
import { SettingsManager } from './features/admin/settings-manager/settings-manager';
import { TeamManager } from './features/admin/team-manager/team-manager';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        component: Home
      },
      {
        path: 'actualites',
        component: NewsList
      },
      {
        path: 'actualites/:slug',
        component: NewsDetail
      },
      {
        path: 'a-propos',
        component: About
      },
      {
        path: 'actions',
        component: ActionsPage,
        title: 'Nos Actions | Sourire Pour Tous'
      },
      {
        path: 'contact',
        component: ContactPage,
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
    component: Login
  },
  {
    path: 'admin/update-password',
    component: UpdatePassword
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Dashboard
      },
      {
        path: 'pages',
        component: PagesManager
      },
      {
        path: 'articles',
        component: ArticlesManager
      },
      {
        path: 'testimonials',
        component: TestimonialsManager
      },
      {
        path: 'settings',
        component: SettingsManager
      },
      {
        path: 'messages',
        component: MessagesManager
      },
      {
        path: 'team',
        component: TeamManager
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
