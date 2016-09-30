import { Component } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppState } from '../../reducers';
import { SettingsState } from '../../reducers/settings';
import { StoreUtil } from '../../shared';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})
export class CompoundComponent {
  settings$: Observable<SettingsState>;
  settings: SettingsState;

  constructor(
    private store: Store<AppState>,
    private storeUtil: StoreUtil,
  ) {

    /* gain access to settings values through the store util */
    this.settings = this.storeUtil.getState().settings;
  }
}
