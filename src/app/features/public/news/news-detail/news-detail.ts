import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ArticlesService, Article } from '../../../../core/services/articles.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './news-detail.html',
  styles: ``
})
export class NewsDetail implements OnInit {
  article = signal<Article | null>(null);
  isLoading = signal<boolean>(true);
  safeContent = signal<SafeHtml>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articlesService: ArticlesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const slug = params.get('slug');
      if (slug) {
        this.isLoading.set(true);
        const article = await this.articlesService.getArticleBySlug(slug);
        if (article) {
          this.article.set(article);
          if (article.content) {
            this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(article.content));
          }
        } else {
          this.router.navigate(['/actualites']);
        }
        this.isLoading.set(false);
      } else {
        this.router.navigate(['/actualites']);
      }
    });
  }

  formatAmount(amount: any): string {
    const num = Number(amount) || 0;
    return num.toLocaleString('fr-FR') + ' €';
  }

  progress(): number {
    const article = this.article();
    if (!article || !article.goal_amount) return 0;
    const p = ((article.collected_amount || 0) / article.goal_amount) * 100;
    return Math.min(Math.round(p), 100);
  }
}
