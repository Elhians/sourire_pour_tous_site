import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Testimonial {
  id?: string;
  author_name: string;
  author_role?: string;
  content: string;
  is_active: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {
  constructor(private supabase: SupabaseService) {}

  async getTestimonials(activeOnly: boolean = false): Promise<Testimonial[]> {
    let query = this.supabase.client
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching testimonials', error);
      return [];
    }
    return data as Testimonial[];
  }

  async createTestimonial(testimonial: Testimonial): Promise<Testimonial | null> {
    const { data, error } = await this.supabase.client
      .from('testimonials')
      .insert([testimonial])
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial', error);
      return null;
    }
    return data as Testimonial;
  }

  async updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial | null> {
    const { data, error } = await this.supabase.client
      .from('testimonials')
      .update(testimonial)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial', error);
      return null;
    }
    return data as Testimonial;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial', error);
      return false;
    }
    return true;
  }
}
