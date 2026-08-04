import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesService, Article } from '../../../../core/services/articles.service';

@Component({
  selector: 'app-priority-campaign-block',
  imports: [CommonModule, RouterLink],
  templateUrl: './priority-campaign-block.html',
  styles: ``
})
export class PriorityCampaignBlock implements OnInit {
  campaign = signal<Article | null>(null);
  progress = signal<number>(0);

  constructor(private articlesService: ArticlesService) {}

  async ngOnInit() {
    const article = await this.articlesService.getPriorityArticle();
    if (article) {
      this.campaign.set(article);
      
      const goal = article.goal_amount || 0;
      const collected = article.collected_amount || 0;
      
      if (goal > 0) {
        let pct = Math.round((collected / goal) * 100);
        if (pct > 100) pct = 100;
        this.progress.set(pct);
      }
    }
  }

  formatAmount(amount: number): string {
    // Format en espaçant les milliers
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' FCFA';
  }
}
