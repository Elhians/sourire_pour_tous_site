import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MessagesService, Message } from '../../../core/services/messages.service';

@Component({
  selector: 'app-messages-manager',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './messages-manager.html',
  styles: ``
})
export class MessagesManager implements OnInit {
  messages = signal<Message[]>([]);
  isLoading = signal(true);
  selectedMessage = signal<Message | null>(null);

  constructor(private messagesService: MessagesService) {}

  ngOnInit() {
    this.loadMessages();
  }

  async loadMessages() {
    this.isLoading.set(true);
    const data = await this.messagesService.getMessages();
    this.messages.set(data);
    this.isLoading.set(false);
  }

  async openMessage(msg: Message) {
    this.selectedMessage.set(msg);
    if (!msg.is_read && msg.id) {
      const success = await this.messagesService.markAsRead(msg.id);
      if (success) {
        // Mettre à jour l'état local
        const updated = this.messages().map(m => m.id === msg.id ? { ...m, is_read: true } : m);
        this.messages.set(updated);
      }
    }
  }

  closeMessage() {
    this.selectedMessage.set(null);
  }
}
