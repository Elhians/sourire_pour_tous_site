import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestimonialsService, Testimonial } from '../../../core/services/testimonials.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-testimonials-manager',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './testimonials-manager.html',
  styles: ``
})
export class TestimonialsManager implements OnInit {
  testimonials = signal<Testimonial[]>([]);
  isLoading = signal<boolean>(true);
  isEditing = signal<boolean>(false);
  currentId = signal<string | null>(null);

  form: FormGroup;
  private notificationService = inject(NotificationService);

  constructor(
    private testimonialsService: TestimonialsService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      author_name: ['', Validators.required],
      author_role: [''],
      content: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadTestimonials();
  }

  async loadTestimonials() {
    this.isLoading.set(true);
    const data = await this.testimonialsService.getTestimonials(false);
    this.testimonials.set(data);
    this.isLoading.set(false);
  }

  openForm() {
    this.isEditing.set(true);
    this.currentId.set(null);
    this.form.reset({ is_active: true });
  }

  editTestimonial(t: Testimonial) {
    this.isEditing.set(true);
    this.currentId.set(t.id!);
    this.form.patchValue(t);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.form.reset();
  }

  async saveTestimonial() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const formValue = this.form.value;
    
    let result;
    if (this.currentId()) {
      result = await this.testimonialsService.updateTestimonial(this.currentId()!, formValue);
    } else {
      result = await this.testimonialsService.createTestimonial(formValue);
    }
    
    if (!result) {
      this.notificationService.showToast('error', "Erreur lors de l'enregistrement. Vérifiez la console.");
      this.isLoading.set(false);
      return;
    }
    
    this.notificationService.showToast('success', "Témoignage enregistré avec succès.");
    this.cancelEdit();
    await this.loadTestimonials();
  }

  async deleteTestimonial(id: string) {
    const confirmed = await this.notificationService.confirm('Voulez-vous vraiment supprimer ce témoignage ?');
    if (confirmed) {
      this.isLoading.set(true);
      await this.testimonialsService.deleteTestimonial(id);
      await this.loadTestimonials();
      this.notificationService.showToast('success', "Témoignage supprimé avec succès.");
    }
  }
}
