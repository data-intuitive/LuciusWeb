import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { AppState, getSidebarOpened } from './reducers';
import { NavActions } from './actions/nav';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  sidebarOpen$: Observable<Boolean>;

  constructor(
    private store: Store<AppState>,
    private navActions: NavActions
  ) {
    this.sidebarOpen$ = store
      .let(getSidebarOpened());
  }

  closeSidebar() {
    this.store.dispatch(this.navActions.toggleSidebar(false));
  }

  handleSidebarClosed() {
    this.store.dispatch(this.navActions.toggleSidebar(false));
  }
}
