import { Component, OnInit, signal } from '@angular/core';
import { TeamMembersService, TeamMember } from '../../../../core/services/team-members.service';
import { SettingsService, SiteSettings } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styles: ``,
})
export class About implements OnInit {
  members = signal<TeamMember[]>([]);
  settings = signal<SiteSettings | null>(null);

  constructor(
    private teamService: TeamMembersService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    const data = await this.teamService.getTeamMembers();
    this.members.set(data);
    
    const settingsData = await this.settingsService.getSettings();
    this.settings.set(settingsData);
  }
}
