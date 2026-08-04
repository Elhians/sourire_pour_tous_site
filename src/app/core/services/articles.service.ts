import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Article {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  published: boolean;
  is_priority?: boolean;
  goal_amount?: number;
  collected_amount?: number;
  tags?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  constructor(private supabase: SupabaseService) {}

  async getArticles(): Promise<Article[]> {
    const { data, error } = await this.supabase.client
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles', error);
      return [];
    }
    return data as Article[];
  }

  async getPublishedArticles(): Promise<Article[]> {
    const { data, error } = await this.supabase.client
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published articles', error);
      return [];
    }
    return data as Article[];
  }

  async getArticle(id: string): Promise<Article | null> {
    const { data, error } = await this.supabase.client
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching article', error);
      return null;
    }
    return data as Article;
  }

  async getPriorityArticle(): Promise<Article | null> {
    const { data, error } = await this.supabase.client
      .from('articles')
      .select('*')
      .eq('is_priority', true)
      .single();

    if (error) {
      // Pas d'article prioritaire ou erreur
      return null;
    }
    return data as Article;
  }

  async getRecentCampaigns(limit: number = 3): Promise<Article[]> {
    const { data, error } = await this.supabase.client
      .from('articles')
      .select('*')
      .gt('goal_amount', 0)
      .eq('is_priority', false)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent campaigns', error);
      return [];
    }
    return data as Article[];
  }

  async getRecentNews(limit: number = 3): Promise<Article[]> {
    const { data, error } = await this.supabase.client
      .from('articles')
      .select('*')
      .or('goal_amount.eq.0,goal_amount.is.null')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent news', error);
      return [];
    }
    return data as Article[];
  }

  async createArticle(article: Article): Promise<Article | null> {
    if (article.is_priority) {
      await this.supabase.client
        .from('articles')
        .update({ is_priority: false })
        .eq('is_priority', true);
    }

    const { data, error } = await this.supabase.client
      .from('articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Error creating article', error);
      return null;
    }
    return data as Article;
  }

  async updateArticle(id: string, article: Partial<Article>): Promise<Article | null> {
    if (article.is_priority) {
      await this.supabase.client
        .from('articles')
        .update({ is_priority: false })
        .eq('is_priority', true);
    }

    const { data, error } = await this.supabase.client
      .from('articles')
      .update(article)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating article', error);
      return null;
    }
    return data as Article;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting article', error);
      return false;
    }
    return true;
  }

  async uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    const { error: uploadError } = await this.supabase.client.storage
      .from('articles-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = this.supabase.client.storage
      .from('articles-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
