import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface TeamMember {
  id?: string;
  name: string;
  role: string;
  quote?: string;
  image_url?: string;
  order_index?: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamMembersService {
  constructor(private supabase: SupabaseService) {}

  async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await this.supabase.client
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members', error);
      return [];
    }
    return data as TeamMember[];
  }

  async createTeamMember(member: TeamMember): Promise<TeamMember | null> {
    const { data, error } = await this.supabase.client
      .from('team_members')
      .insert([member])
      .select()
      .single();

    if (error) {
      console.error('Error creating team member', error);
      return null;
    }
    return data as TeamMember;
  }

  async updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember | null> {
    const { data, error } = await this.supabase.client
      .from('team_members')
      .update(member)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member', error);
      return null;
    }
    return data as TeamMember;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member', error);
      return false;
    }
    return true;
  }

  async uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}_${Date.now()}.${fileExt}`;
    const filePath = `team/${fileName}`;

    const { error: uploadError } = await this.supabase.client.storage
      .from('public-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = this.supabase.client.storage
      .from('public-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
