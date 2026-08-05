import { Component, OnInit, signal } from '@angular/core';
import { SettingsService, SiteSettings } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-actions-page',
  standalone: true,
  imports: [],
  templateUrl: './actions-page.html',
  styles: ``,
})
export class ActionsPage implements OnInit {
  settings = signal<SiteSettings | null>(null);

  constructor(private settingsService: SettingsService) {}

  async ngOnInit() {
    const data = await this.settingsService.getSettings();
    this.settings.set(data);
  }
}
