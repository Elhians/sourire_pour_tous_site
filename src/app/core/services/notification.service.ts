import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ConfirmDialogData {
  message: string;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<ToastMessage[]>([]);
  confirmDialog = signal<ConfirmDialogData | null>(null);

  showToast(type: 'success' | 'error' | 'info', message: string, duration = 3000) {
    const id = crypto.randomUUID();
    this.toasts.update(current => [...current, { id, type, message }]);
    
    setTimeout(() => {
      this.toasts.update(current => current.filter(t => t.id !== id));
    }, duration);
  }

  async confirm(message: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirmDialog.set({ message, resolve });
    });
  }

  closeConfirm(result: boolean) {
    const current = this.confirmDialog();
    if (current) {
      current.resolve(result);
      this.confirmDialog.set(null);
    }
  }

  removeToast(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
