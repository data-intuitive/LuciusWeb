import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { Store } from '@ngrx/store';
import { LayoutActions, SettingsActions } from './actions';

import { AppState, getSidenavOpened } from './reducers';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  sidenavOpen$: Observable<Boolean>;

  constructor(
    private store: Store<AppState>,
    private settingsActions: SettingsActions,
    private layoutActions: LayoutActions
  ) {
    this.sidenavOpen$ =
      store.let(getSidenavOpened());
  }

  ngOnInit() {
    this.store.dispatch(this.settingsActions.init());
  }

  closeSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(false));
  }

}
