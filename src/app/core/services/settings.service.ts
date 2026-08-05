import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface SiteSettings {
  id?: string;
  volunteers_count: number;
  beneficiaries_count: number;
  projects_count: number;
  contact_email: string;
  contact_phone: string;
  address: string;
  facebook_url?: string;
  instagram_url?: string;
  snapchat_url?: string;
  tiktok_url?: string;
  whatsapp_url?: string;
  donation_mobile_money?: string;
  donation_paypal_email?: string;
  donation_paypal_name?: string;
  donation_contact_info?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private supabase: SupabaseService) {}

  async getSettings(): Promise<SiteSettings> {
    const { data, error } = await this.supabase.client
      .from('site_settings')
      .select('*')
      .maybeSingle();

    const defaultSettings: SiteSettings = {
      volunteers_count: 0,
      beneficiaries_count: 0,
      projects_count: 0,
      contact_email: 'contact@sourirepourtous.org',
      contact_phone: '+33 (0)1 23 45 67 89',
      address: '123 Rue de la Solidarité, 75001 Paris, France',
      facebook_url: '',
      instagram_url: '',
      snapchat_url: '',
      tiktok_url: '',
      whatsapp_url: '',
      donation_mobile_money: '+221 78 867 35 50',
      donation_paypal_email: 'sourirepourtous@gmail.com',
      donation_paypal_name: 'Ndeye Awa Séne',
      donation_contact_info: '+221 78 867 35 50 / +221 77 876 93 54'
    };

    if (error || !data) {
      return defaultSettings;
    }
    
    return { ...defaultSettings, ...(data as SiteSettings) };
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<boolean> {
    const { data: existingData } = await this.supabase.client
      .from('site_settings')
      .select('id')
      .maybeSingle();

    if (existingData) {
      const { error } = await this.supabase.client
        .from('site_settings')
        .update(settings)
        .eq('id', existingData.id);
      if (error) console.error("Error updating settings", error);
      return !error;
    } else {
      const { error } = await this.supabase.client
        .from('site_settings')
        .insert([settings]);
      if (error) console.error("Error inserting settings", error);
      return !error;
    }
  }
}
