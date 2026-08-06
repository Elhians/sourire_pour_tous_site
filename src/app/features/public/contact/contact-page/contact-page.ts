import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessagesService } from '../../../../core/services/messages.service';
import { SettingsService, SiteSettings } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-page.html',
  styles: ``,
})
export class ContactPage implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  
  settings = signal<SiteSettings | null>(null);

  constructor(
    private fb: FormBuilder,
    private messagesService: MessagesService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    this.settings.set(await this.settingsService.getSettings());
    
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['Je souhaite faire un don', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async onSubmit() {
    if (this.contactForm.invalid) return;

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    const val = this.contactForm.value;
    const fullName = `${val.firstName} ${val.lastName}`.trim();

    const result = await this.messagesService.sendMessage({
      name: fullName,
      email: val.email,
      subject: val.subject,
      message: val.message
    });

    this.isSubmitting = false;

    if (result) {
      this.submitSuccess = true;
      this.contactForm.reset({ subject: 'Je souhaite faire un don' });
    } else {
      this.submitError = true;
    }
  }
}
