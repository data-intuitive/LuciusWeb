import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as fromSettings from '../../reducers/settings';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})
export class CompoundComponent {
  settings$: Observable<fromSettings.State>;

  constructor(
    private store: Store<fromRoot.State>
  ) {

    // subscribe to settings state
    // this.settings$ = ...
  }
}
