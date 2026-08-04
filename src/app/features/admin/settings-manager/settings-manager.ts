import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, SiteSettings } from '../../../core/services/settings.service';

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
    const settings = await this.settingsService.getSettings();
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
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } else {
      alert("Erreur lors de l'enregistrement des paramètres.");
    }
  }
}
