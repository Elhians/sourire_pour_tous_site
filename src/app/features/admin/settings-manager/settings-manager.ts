import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, SiteSettings } from '../../../core/services/settings.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-settings-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-manager.html',
  styles: ``
})
export class SettingsManager implements OnInit {
  settingsForm: FormGroup;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);

  notificationService = inject(NotificationService);

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.settingsForm = this.fb.group({
      volunteers_count: [0, [Validators.required, Validators.min(0)]],
      beneficiaries_count: [0, [Validators.required, Validators.min(0)]],
      projects_count: [0, [Validators.required, Validators.min(0)]],
      contact_email: ['', [Validators.required, Validators.email]],
      contact_phone: ['', Validators.required],
      address: ['', Validators.required],
      facebook_url: [''],
      instagram_url: [''],
      snapchat_url: [''],
      tiktok_url: [''],
      whatsapp_url: [''],
      donation_mobile_money: [''],
      donation_paypal_email: ['', Validators.email],
      donation_paypal_name: [''],
      donation_contact_info: ['']
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  async loadSettings() {
    this.isLoading.set(true);
    const settings = await this.settingsService.getSettings(true); // force refresh on admin
    this.settingsForm.patchValue(settings);
    this.isLoading.set(false);
  }

  async saveSettings() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveSuccess.set(false);
    
    const success = await this.settingsService.updateSettings(this.settingsForm.value);
    
    this.isSaving.set(false);
    if (success) {
      this.saveSuccess.set(true);
      this.notificationService.showToast('success', 'Paramètres mis à jour avec succès.');
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } else {
      this.notificationService.showToast('error', "Erreur lors de l'enregistrement des paramètres.");
    }
  }
}
