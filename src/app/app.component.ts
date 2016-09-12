import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { AppState, getSidenavOpened } from './reducers';
import { NavActions } from './actions/nav';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  sidenavOpen$: Observable<Boolean>;

  constructor(
    private store: Store<AppState>,
    private navActions: NavActions
  ) {
    this.sidenavOpen$ = store
      .let(getSidenavOpened());
  }

  handleSidenavClosed() {
    this.store.dispatch(this.navActions.toggleSidenav(false));
  }
}
