import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsPage } from './actions-page';

describe('ActionsPage', () => {
  let component: ActionsPage;
  let fixture: ComponentFixture<ActionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
