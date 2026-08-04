import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérification asynchrone de la session
  const session = await authService.getSession();
  
  if (session) {
    return true;
  }
  
  return router.parseUrl('/admin/login');
};
