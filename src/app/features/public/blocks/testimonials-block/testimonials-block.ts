import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsService, Testimonial } from '../../../../core/services/testimonials.service';

@Component({
  selector: 'app-testimonials-block',
  imports: [CommonModule],
  templateUrl: './testimonials-block.html',
  styles: ``
})
export class TestimonialsBlock implements OnInit, OnDestroy {
  @Input() config: any;
  testimonials = signal<Testimonial[]>([]);
  currentIndex = signal<number>(0);
  private intervalId: any;

  constructor(private testimonialsService: TestimonialsService) {}

  async ngOnInit() {
    const data = await this.testimonialsService.getTestimonials(true);
    // If no testimonials in DB, show a default one
    if (data.length === 0) {
      this.testimonials.set([{
        author_name: 'Myriam B.',
        author_role: 'Bénéficiaire, Paris',
        content: "Sourire Pour Tous m'a permis de retrouver de l'espoir. Grâce à leur accompagnement, ma famille a pu traverser une période très difficile avec dignité. Ce n'est pas qu'une aide matérielle, c'est une vraie présence humaine.",
        is_active: true
      }]);
    } else {
      this.testimonials.set(data);
    }
    
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay(); // avoid multiple intervals
    if (this.testimonials().length > 1) {
      this.intervalId = setInterval(() => {
        this.next();
      }, 6000);
    }
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  next() {
    const nextIdx = (this.currentIndex() + 1) % this.testimonials().length;
    this.currentIndex.set(nextIdx);
  }

  prev() {
    const nextIdx = (this.currentIndex() - 1 + this.testimonials().length) % this.testimonials().length;
    this.currentIndex.set(nextIdx);
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.startAutoPlay(); // reset timer
  }

  onManualNext() {
    this.next();
    this.startAutoPlay();
  }

  onManualPrev() {
    this.prev();
    this.startAutoPlay();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }
}
