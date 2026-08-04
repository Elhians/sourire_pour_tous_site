import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-block',
  imports: [RouterLink],
  templateUrl: './hero-block.html',
  styles: ``,
})
export class HeroBlock {
  @Input() config: any = {};
  imageError = false;
}
