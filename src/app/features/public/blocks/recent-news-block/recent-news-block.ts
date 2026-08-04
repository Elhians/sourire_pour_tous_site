import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesService, Article } from '../../../../core/services/articles.service';

@Component({
  selector: 'app-recent-news-block',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './recent-news-block.html',
  styles: ``
})
export class RecentNewsBlock implements OnInit {
  news = signal<Article[]>([]);
  isLoading = signal<boolean>(true);

  constructor(private articlesService: ArticlesService) {}

  async ngOnInit() {
    const data = await this.articlesService.getRecentNews(3);
    this.news.set(data);
    this.isLoading.set(false);
  }
}
