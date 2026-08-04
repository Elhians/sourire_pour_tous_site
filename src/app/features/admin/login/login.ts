import { Component, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styles: ``
})
export class Login {
  loginForm;
  errorMessage = signal<string>('');
  resetMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  isResetMode = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  toggleResetMode(event: Event) {
    event.preventDefault();
    this.isResetMode.update(v => !v);
    this.errorMessage.set('');
    this.resetMessage.set('');
    this.showPassword.set(false);
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  async onResetPassword() {
    let email = this.loginForm.get('email')?.value;
    if (!email) {
      this.errorMessage.set('Veuillez entrer votre adresse email.');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.resetMessage.set('');
    
    email = email.trim();
    const { error } = await this.authService.resetPasswordForEmail(email);
    
    this.isLoading.set(false);
    
    if (error) {
      this.errorMessage.set("Erreur lors de l'envoi de l'email.");
    } else {
      this.resetMessage.set('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
    }
  }

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    let { email, password } = this.loginForm.getRawValue();
    email = email.trim();
    const { error } = await this.authService.signIn(email, password);

    this.isLoading.set(false);

    if (error) {
      this.errorMessage.set('Email ou mot de passe incorrect.');
    } else {
      this.router.navigate(['/admin']);
    }
  }
}
