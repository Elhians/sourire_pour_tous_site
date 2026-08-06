import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamMembersService, TeamMember } from '../../../core/services/team-members.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-team-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-manager.html',
  styles: ``
})
export class TeamManager implements OnInit {
  members = signal<TeamMember[]>([]);
  isLoading = signal<boolean>(true);
  
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  
  memberForm: FormGroup;
  currentMemberId = signal<string | null>(null);
  
  selectedFile = signal<File | null>(null);
  currentImageUrl = signal<string | null>(null);

  private notificationService = inject(NotificationService);

  constructor(
    private teamService: TeamMembersService,
    private fb: FormBuilder
  ) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      quote: [''],
      order_index: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.loadMembers();
  }

  async loadMembers() {
    this.isLoading.set(true);
    const data = await this.teamService.getTeamMembers();
    this.members.set(data);
    this.isLoading.set(false);
  }

  openNewMemberForm() {
    this.memberForm.reset({ order_index: this.members().length });
    this.currentMemberId.set(null);
    this.selectedFile.set(null);
    this.currentImageUrl.set(null);
    this.isEditing.set(true);
  }

  editMember(member: TeamMember) {
    this.memberForm.patchValue({
      name: member.name,
      role: member.role,
      quote: member.quote,
      order_index: member.order_index
    });
    this.currentMemberId.set(member.id!);
    this.currentImageUrl.set(member.image_url || null);
    this.selectedFile.set(null);
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  async saveMember() {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    
    let imageUrl = this.currentImageUrl();
    const file = this.selectedFile();
    if (file) {
      const uploadedUrl = await this.teamService.uploadImage(file);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        this.notificationService.showToast('error', "Erreur lors de l'upload de l'image");
        this.isSaving.set(false);
        return;
      }
    }

    const memberData: TeamMember = {
      ...this.memberForm.value,
      image_url: imageUrl
    };

    const id = this.currentMemberId();
    if (id) {
      await this.teamService.updateTeamMember(id, memberData);
    } else {
      await this.teamService.createTeamMember(memberData);
    }

    this.isSaving.set(false);
    this.isEditing.set(false);
    this.loadMembers();
  }

  async deleteMember(id: string) {
    const confirmed = await this.notificationService.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?');
    if (confirmed) {
      const success = await this.teamService.deleteTeamMember(id);
      if (success) {
        this.loadMembers();
        this.notificationService.showToast('success', "Membre supprimé avec succès");
      } else {
        this.notificationService.showToast('error', "Erreur lors de la suppression");
      }
    }
  }
}
