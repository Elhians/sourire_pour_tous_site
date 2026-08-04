import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeamMembersService, TeamMember } from '../../../../core/services/team-members.service';

@Component({
  selector: 'app-about-block',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-block.html',
  styles: ``
})
export class AboutBlock implements OnInit {
  @Input() config: any;
  members = signal<TeamMember[]>([]);

  constructor(private teamService: TeamMembersService) {}

  async ngOnInit() {
    const data = await this.teamService.getTeamMembers();
    this.members.set(data);
  }

  scrollLeft(el: HTMLElement) {
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
  }

  scrollRight(el: HTMLElement) {
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
  }
}
