import { Component, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-update-password',
  imports: [ReactiveFormsModule],
  templateUrl: './update-password.html',
  styles: ``
})
export class UpdatePassword {
  passwordForm;
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.passwordForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { password } = this.passwordForm.getRawValue();
    const { error } = await this.authService.updatePassword(password);

    this.isLoading.set(false);

    if (error) {
      this.errorMessage.set('Erreur lors de la mise à jour du mot de passe. Le lien est peut-être expiré.');
    } else {
      this.successMessage.set('Votre mot de passe a été mis à jour avec succès !');
      setTimeout(() => {
        this.router.navigate(['/admin/login']);
      }, 3000);
    }
  }
}
