import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticlesService } from '../../../core/services/articles.service';
import { TestimonialsService } from '../../../core/services/testimonials.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  articlesCount = signal<number>(0);
  testimonialsCount = signal<number>(0);
  volunteersCount = signal<number>(0);

  constructor(
    private articlesService: ArticlesService,
    private testimonialsService: TestimonialsService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    const articles = await this.articlesService.getArticles();
    this.articlesCount.set(articles.length);

    const testimonials = await this.testimonialsService.getTestimonials(false);
    this.testimonialsCount.set(testimonials.length);

    const settings = await this.settingsService.getSettings();
    this.volunteersCount.set(settings.volunteers_count || 0);
  }
}
