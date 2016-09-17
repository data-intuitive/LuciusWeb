import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { Router } from '@angular/router';

import { AppState, getSidenavOpened } from './reducers';
import { LayoutActions } from './actions/layout';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  sidenavOpen$: Observable<Boolean>;

  constructor(
    private store: Store<AppState>,
    private layoutActions: LayoutActions,
    private router: Router
  ) {
      this.router.events.subscribe(ev => this.closeSidenav());
      this.sidenavOpen$ = store
        .let(getSidenavOpened());
  }

  openSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(true));
  }

  closeSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(false));
  }

}
