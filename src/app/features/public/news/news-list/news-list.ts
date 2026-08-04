import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesService, Article } from '../../../../core/services/articles.service';

@Component({
  selector: 'app-news-list',
  imports: [CommonModule],
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
}
