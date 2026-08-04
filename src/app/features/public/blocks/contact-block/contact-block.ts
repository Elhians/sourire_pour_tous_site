import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SettingsService, SiteSettings } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-contact-block',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-block.html',
  styles: ``
})
export class ContactBlock implements OnInit {
  @Input() config: any;
  settings = signal<SiteSettings | null>(null);

  constructor(private settingsService: SettingsService) {}

  async ngOnInit() {
    const data = await this.settingsService.getSettings();
    this.settings.set(data);
  }
}
