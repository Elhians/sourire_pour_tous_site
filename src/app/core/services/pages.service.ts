import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface PageBlock {
  type: string; // 'hero', 'stats', 'actions', 'testimonials'
  order: number;
  config: any; // specific data for this block
  isVisible: boolean;
}

export interface PageModel {
  id?: string;
  page_name: string;
  blocks: PageBlock[];
}

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  constructor(private supabase: SupabaseService) {}

  async getPageBlocks(pageName: string): Promise<PageBlock[]> {
    const { data, error } = await this.supabase.client
      .from('pages_blocks')
      .select('*')
      .eq('page_name', pageName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching page blocks', error);
      return [];
    }

    if (!data) {
      // Default empty structure if no data exists
      return [];
    }

    return data.blocks as PageBlock[];
  }

  async savePageBlocks(pageName: string, blocks: PageBlock[]): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('pages_blocks')
      .upsert({ page_name: pageName, blocks: blocks }, { onConflict: 'page_name' });
      
    if (error) {
      console.error('Error saving page blocks', error);
      return false;
    }
    
    return true;
  }
}
