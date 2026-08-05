import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesService, Article } from '../../../../core/services/articles.service';

@Component({
  selector: 'app-news-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './news-list.html',
  styles: ``
})
export class NewsList implements OnInit {
  articles = signal<Article[]>([]);
  isLoading = signal<boolean>(true);

  constructor(private articlesService: ArticlesService) {}

  ngOnInit() {
    this.loadArticles();
  }

  async loadArticles() {
    this.isLoading.set(true);
    const data = await this.articlesService.getPublishedArticles();
    this.articles.set(data);
    this.isLoading.set(false);
  }

  formatAmount(amount: any): string {
    const num = Number(amount) || 0;
    return num.toLocaleString('fr-FR') + ' €';
  }

  getProgress(article: Article): number {
    if (!article.goal_amount) return 0;
    const collected = Number(article.collected_amount) || 0;
    const goal = Number(article.goal_amount) || 1;
    return Math.min((collected / goal) * 100, 100);
  }
}
