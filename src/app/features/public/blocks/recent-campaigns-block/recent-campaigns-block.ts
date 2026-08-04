import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesService, Article } from '../../../../core/services/articles.service';

@Component({
  selector: 'app-recent-campaigns-block',
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-campaigns-block.html',
  styles: ``
})
export class RecentCampaignsBlock implements OnInit {
  campaigns = signal<(Article & { progress: number, parsedTags: string[] })[]>([]);

  constructor(private articlesService: ArticlesService) {}

  async ngOnInit() {
    const data = await this.articlesService.getRecentCampaigns(3);
    const mapped = data.map(campaign => {
      const goal = campaign.goal_amount || 0;
      const collected = campaign.collected_amount || 0;
      let pct = 0;
      if (goal > 0) {
        pct = Math.round((collected / goal) * 100);
        if (pct > 100) pct = 100;
      }
      
      let parsedTags: string[] = [];
      if (campaign.tags) {
        parsedTags = campaign.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
      
      return { ...campaign, progress: pct, parsedTags };
    });
    
    this.campaigns.set(mapped);
  }

  formatAmount(amount: number): string {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' FCFA';
  }
}
