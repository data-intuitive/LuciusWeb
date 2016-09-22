import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})
export class CompoundComponent {

  constructor(private store: Store<AppState>) {

  }

}
