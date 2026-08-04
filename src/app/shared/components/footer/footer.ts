import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService, SiteSettings } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styles: ``,
})
export class Footer implements OnInit {
  settings = signal<SiteSettings | null>(null);

  constructor(private settingsService: SettingsService) {}

  async ngOnInit() {
    const data = await this.settingsService.getSettings();
    this.settings.set(data);
  }
}
