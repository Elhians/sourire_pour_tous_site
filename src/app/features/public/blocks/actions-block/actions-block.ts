import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-actions-block',
  imports: [],
  templateUrl: './actions-block.html',
  styles: ``,
})
export class ActionsBlock {
  @Input() config: any = {};
}
