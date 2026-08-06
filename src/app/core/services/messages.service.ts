import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface Message {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

  // Envoyer un message (côté public)
  async sendMessage(msg: Message): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .insert([{
          name: msg.name,
          email: msg.email,
          subject: msg.subject,
          message: msg.message
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Récupérer tous les messages (côté admin)
  async getMessages(): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Marquer un message comme lu
  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }
}
