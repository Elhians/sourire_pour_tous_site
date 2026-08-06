import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesService, PageBlock } from '../../../core/services/pages.service';

import { HeroBlock } from '../blocks/hero-block/hero-block';
import { StatsBlock } from '../blocks/stats-block/stats-block';
import { ActionsBlock } from '../blocks/actions-block/actions-block';
import { TestimonialsBlock } from '../blocks/testimonials-block/testimonials-block';
import { PriorityCampaignBlock } from '../blocks/priority-campaign-block/priority-campaign-block';
import { RecentCampaignsBlock } from '../blocks/recent-campaigns-block/recent-campaigns-block';
import { AboutBlock } from '../blocks/about-block/about-block';
import { ContactBlock } from '../blocks/contact-block/contact-block';
import { RecentNewsBlock } from '../blocks/recent-news-block/recent-news-block';

@Component({
  selector: 'app-home',
  imports: [CommonModule, HeroBlock, StatsBlock, ActionsBlock, TestimonialsBlock, PriorityCampaignBlock, RecentCampaignsBlock, AboutBlock, ContactBlock, RecentNewsBlock],
  templateUrl: './home.html',
  styles: ``
})
export class Home implements OnInit {
  blocks = signal<PageBlock[]>([]);
  isLoading = signal<boolean>(true);

  constructor(private pagesService: PagesService) {}

  ngOnInit() {
    this.loadPageBlocks();
  }

  async loadPageBlocks() {
    this.isLoading.set(true);
    try {
      let data = await this.pagesService.getPageBlocks('home');
      
      // Si la base est vide on charge le layout par défaut
      if (data.length === 0) {
        data = [
          { type: 'hero', order: 1, isVisible: true, config: { title: 'Sourire Pour Tous', subtitle: 'Agissons ensemble pour redonner le sourire à ceux qui en ont besoin.', ctaText: 'Faire un don' } },
          { type: 'stats', order: 4, isVisible: true, config: { projects: 45, beneficiaries: 12500, volunteers: 120 } },
          { type: 'actions', order: 3, isVisible: true, config: {} },
          { type: 'testimonials', order: 7, isVisible: true, config: {} }
        ];
      }

      // Always push the hardcoded non-CMS blocks to ensure they appear
      const allBlocks = [...data];

      const injectedBlocks = [
        { type: 'about', isVisible: true, config: {} },
        { type: 'priority-campaign', isVisible: true, config: {} },
        { type: 'recent-campaigns', isVisible: true, config: {} },
        { type: 'recent-news', isVisible: true, config: {} },
        { type: 'contact', isVisible: true, config: {} }
      ];

      for (const b of injectedBlocks) {
        if (!allBlocks.find(existing => existing.type === b.type)) {
          allBlocks.push(b as PageBlock);
        }
      }

      // Strict order map requested by user
      const orderMap: Record<string, number> = {
        'hero': 10,
        'about': 20,
        'actions': 30, // Domaines d'intervention
        'stats': 40,
        'priority-campaign': 50,
        'recent-campaigns': 60,
        'recent-news': 65,
        'testimonials': 70,
        'contact': 80
      };

      // Filter, assign orders, sort
      const visibleBlocks = allBlocks
        .filter(b => b.isVisible)
        .map(b => {
          return { ...b, order: orderMap[b.type] || 100 }; // Apply strict order
        })
        .sort((a, b) => a.order - b.order);
        
      this.blocks.set(visibleBlocks);
    } catch (err) {
      console.error('Erreur lors du chargement des blocs:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
