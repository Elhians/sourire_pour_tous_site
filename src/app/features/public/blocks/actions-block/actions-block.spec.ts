import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsBlock } from './actions-block';

describe('ActionsBlock', () => {
  let component: ActionsBlock;
  let fixture: ComponentFixture<ActionsBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
