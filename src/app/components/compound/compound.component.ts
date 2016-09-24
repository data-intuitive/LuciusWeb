import { Component } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppState, getSettings } from '../../reducers';
import { SettingsState } from '../../reducers/settings';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})
export class CompoundComponent {
  settings$: Observable<SettingsState>;

  constructor(
    private store: Store<AppState>
  ) {
    this.settings$ = this.store.let(getSettings());
  }
}
