import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesManager } from './articles-manager';

describe('ArticlesManager', () => {
  let component: ArticlesManager;
  let fixture: ComponentFixture<ArticlesManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesManager],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticlesManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
