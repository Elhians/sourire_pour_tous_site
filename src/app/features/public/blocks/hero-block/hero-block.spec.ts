import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBlock } from './hero-block';

describe('HeroBlock', () => {
  let component: HeroBlock;
  let fixture: ComponentFixture<HeroBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
