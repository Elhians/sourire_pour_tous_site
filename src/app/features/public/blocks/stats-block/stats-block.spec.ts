import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsBlock } from './stats-block';

describe('StatsBlock', () => {
  let component: StatsBlock;
  let fixture: ComponentFixture<StatsBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
