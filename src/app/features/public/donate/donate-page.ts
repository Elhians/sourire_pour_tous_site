import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, SiteSettings } from '../../../core/services/settings.service';

@Component({
  selector: 'app-donate-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donate-page.html',
  styles: ``
})
export class DonatePage implements OnInit {
  settings = signal<SiteSettings | null>(null);
  isLoading = signal(true);

  constructor(private settingsService: SettingsService) {}

  async ngOnInit() {
    const data = await this.settingsService.getSettings();
    this.settings.set(data);
    this.isLoading.set(false);
  }
}
