import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser = signal<User | null>(null);

  constructor(private supabaseService: SupabaseService) {
    this.initAuthSession();
  }

  private initAuthSession() {
    this.supabaseService.client.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
    });

    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async getSession() {
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    return session;
  }

  async signIn(email: string, password: string) {
    return this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut() {
    return this.supabaseService.client.auth.signOut();
  }

  async resetPasswordForEmail(email: string) {
    return this.supabaseService.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/update-password`
    });
  }

  async updatePassword(password: string) {
    return this.supabaseService.client.auth.updateUser({ password });
  }
}
