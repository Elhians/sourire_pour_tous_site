import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticlesService, Article } from '../../../core/services/articles.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-articles-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './articles-manager.html',
  styles: ``
})
export class ArticlesManager implements OnInit {
  articles = signal<Article[]>([]);
  isLoading = signal<boolean>(true);
  isEditing = signal<boolean>(false);
  currentArticleId = signal<string | null>(null);
  
  selectedCoverFile = signal<File | null>(null);
  currentCoverUrl = signal<string | null>(null);
  
  isUploadingContentImage = signal<boolean>(false);
  lastUploadedMarkdown = signal<string | null>(null);

  articleForm: FormGroup;
  private notificationService = inject(NotificationService);

  constructor(
    private articlesService: ArticlesService, 
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      excerpt: [''],
      content: ['', Validators.required],
      published: [false],
      is_priority: [false],
      goal_amount: [0],
      collected_amount: [0],
      tags: ['']
    });
  }

  ngOnInit() {
    this.loadArticles();
    this.route.queryParams.subscribe(params => {
      if (params['new'] === 'true') {
        this.openNewArticleForm();
      }
    });
  }

  async loadArticles() {
    this.isLoading.set(true);
    const data = await this.articlesService.getArticles();
    this.articles.set(data);
    this.isLoading.set(false);
  }

  openNewArticleForm() {
    this.isEditing.set(true);
    this.currentArticleId.set(null);
    this.selectedCoverFile.set(null);
    this.currentCoverUrl.set(null);
    this.lastUploadedMarkdown.set(null);
    this.articleForm.reset({ published: false, is_priority: false, goal_amount: 0, collected_amount: 0, tags: '' });
  }

  editArticle(article: Article) {
    this.isEditing.set(true);
    this.currentArticleId.set(article.id!);
    this.selectedCoverFile.set(null);
    this.currentCoverUrl.set(article.cover_image || null);
    this.lastUploadedMarkdown.set(null);
    this.articleForm.patchValue(article);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.currentArticleId.set(null);
    this.selectedCoverFile.set(null);
    this.currentCoverUrl.set(null);
    this.articleForm.reset();
    
    // Nettoyer l'URL si on vient du dashboard (?new=true)
    this.router.navigate(['/admin/articles'], { replaceUrl: true });
  }

  onCoverFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCoverFile.set(input.files[0]);
    }
  }

  async onContentImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.isUploadingContentImage.set(true);
      const file = input.files[0];
      const url = await this.articlesService.uploadImage(file);
      this.isUploadingContentImage.set(false);
      
      if (url) {
        // Construct markdown snippet
        const markdown = `![${file.name}](${url})`;
        this.lastUploadedMarkdown.set(markdown);
      } else {
        this.notificationService.showToast('error', "Erreur lors de l'upload de l'image.");
      }
      // Reset input
      input.value = '';
    }
  }

  copyMarkdown() {
    const md = this.lastUploadedMarkdown();
    if (md) {
      navigator.clipboard.writeText(md);
      // Optional: you could add a temporary tooltip or toast here
    }
  }

  async saveArticle() {
    if (this.articleForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.articleForm.value;
    
    // Upload cover image if selected
    if (this.selectedCoverFile()) {
      const url = await this.articlesService.uploadImage(this.selectedCoverFile()!);
      if (url) {
        formValue.cover_image = url;
      }
    } else if (this.currentCoverUrl()) {
      formValue.cover_image = this.currentCoverUrl();
    }
    
    let result;
    if (this.currentArticleId()) {
      result = await this.articlesService.updateArticle(this.currentArticleId()!, formValue);
    } else {
      result = await this.articlesService.createArticle(formValue);
    }
    
    if (!result) {
      this.notificationService.showToast('error', "Une erreur est survenue lors de l'enregistrement de l'article.");
      this.isLoading.set(false);
      return;
    }
    
    this.cancelEdit();
    await this.loadArticles();
  }

  async deleteArticle(id: string) {
    const confirmed = await this.notificationService.confirm('Voulez-vous vraiment supprimer cet article ?');
    if (confirmed) {
      this.isLoading.set(true);
      await this.articlesService.deleteArticle(id);
      await this.loadArticles();
      this.notificationService.showToast('success', "Article supprimé avec succès.");
    }
  }
}
