import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, SiteSettings } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-stats-block',
  imports: [CommonModule],
  templateUrl: './stats-block.html',
  styles: ``
})
export class StatsBlock implements AfterViewInit, OnInit {
  @ViewChild('statsSection') statsSection!: ElementRef;

  animatedBeneficiaries = 0;
  animatedVolunteers = 0;
  animatedProjects = 0;
  
  hasAnimated = false;
  settings: SiteSettings | null = null;

  constructor(
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.settings = await this.settingsService.getSettings();
    if (this.hasAnimated) {
      this.animateNumbers();
    }
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          if (this.settings) {
            this.animateNumbers();
          }
        }
      });
    }, { threshold: 0.3 });
    
    if (this.statsSection) {
      observer.observe(this.statsSection.nativeElement);
    }
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  animateNumbers() {
    if (!this.settings) return;
    
    const targetBeneficiaries = this.settings.beneficiaries_count || 0;
    const targetVolunteers = this.settings.volunteers_count || 0;
    const targetProjects = this.settings.projects_count || 0;
    
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    const updateNumbers = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      this.animatedBeneficiaries = Math.floor(targetBeneficiaries * easeProgress);
      this.animatedVolunteers = Math.floor(targetVolunteers * easeProgress);
      this.animatedProjects = Math.floor(targetProjects * easeProgress);
      this.cdr.detectChanges();
      
      if (progress < 1) {
        requestAnimationFrame(updateNumbers);
      } else {
        this.animatedBeneficiaries = targetBeneficiaries;
        this.animatedVolunteers = targetVolunteers;
        this.animatedProjects = targetProjects;
        this.cdr.detectChanges();
      }
    };
    
    requestAnimationFrame(updateNumbers);
  }
}
