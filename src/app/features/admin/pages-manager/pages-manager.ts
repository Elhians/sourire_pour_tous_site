import { Component, OnInit, signal } from '@angular/core';
import { PagesService, PageBlock } from '../../../core/services/pages.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pages-manager',
  imports: [CommonModule],
  templateUrl: './pages-manager.html',
  styles: ``
})
export class PagesManager implements OnInit {
  blocks = signal<PageBlock[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);

  constructor(private pagesService: PagesService) {}

  ngOnInit() {
    this.loadBlocks();
  }

  async loadBlocks() {
    this.isLoading.set(true);
    
    let data = await this.pagesService.getPageBlocks('home');
    
    if (data.length === 0) {
      data = [
        { type: 'hero', order: 1, isVisible: true, config: { title: 'Bienvenue sur Sourire Pour Tous', subtitle: 'Ensemble pour un monde meilleur', ctaText: 'Faire un don' } },
        { type: 'stats', order: 2, isVisible: true, config: { projects: 120, beneficiaries: 5000, volunteers: 300 } },
        { type: 'actions', order: 3, isVisible: true, config: { limit: 3 } },
        { type: 'testimonials', order: 4, isVisible: true, config: {} }
      ];
    }
    
    this.blocks.set(data.sort((a, b) => a.order - b.order));
    this.isLoading.set(false);
  }

  moveUp(index: number) {
    if (index === 0) return;
    const currentBlocks = [...this.blocks()];
    const temp = currentBlocks[index - 1];
    currentBlocks[index - 1] = currentBlocks[index];
    currentBlocks[index] = temp;
    
    currentBlocks.forEach((block, i) => block.order = i + 1);
    this.blocks.set(currentBlocks);
  }

  moveDown(index: number) {
    const currentBlocks = [...this.blocks()];
    if (index === currentBlocks.length - 1) return;
    const temp = currentBlocks[index + 1];
    currentBlocks[index + 1] = currentBlocks[index];
    currentBlocks[index] = temp;
    
    currentBlocks.forEach((block, i) => block.order = i + 1);
    this.blocks.set(currentBlocks);
  }

  toggleVisibility(index: number) {
    const currentBlocks = [...this.blocks()];
    currentBlocks[index].isVisible = !currentBlocks[index].isVisible;
    this.blocks.set(currentBlocks);
  }

  async saveChanges() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    
    const success = await this.pagesService.savePageBlocks('home', this.blocks());
    
    this.isSaving.set(false);
    if (success) {
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }
  }
}
