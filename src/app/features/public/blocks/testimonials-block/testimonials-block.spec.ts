import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsBlock } from './testimonials-block';

describe('TestimonialsBlock', () => {
  let component: TestimonialsBlock;
  let fixture: ComponentFixture<TestimonialsBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialsBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimonialsBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
