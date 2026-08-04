import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesManager } from './pages-manager';

describe('PagesManager', () => {
  let component: PagesManager;
  let fixture: ComponentFixture<PagesManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesManager],
    }).compileComponents();

    fixture = TestBed.createComponent(PagesManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
