import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { AppState, getSidenavOpened, checkIfDashEnabled } from './reducers';
import { NavActions } from './actions/nav';
import { DashActions } from './actions/dash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  sidenavOpen$: Observable<Boolean>;
  dashEnabled$: Observable<Boolean>;
  currentComponent: string;

  constructor(
    private store: Store<AppState>,
    private navActions: NavActions,
    private dashActions: DashActions,
    private router: Router
  ) {
    this.currentComponent = 'Dashboard';
    this.sidenavOpen$ = store
      .let(getSidenavOpened());
    this.dashEnabled$ = store
      .let(checkIfDashEnabled());
  }

  navToDasboard() {
      // call to the store to update activeComponent
      this.currentComponent = 'Dashboard';
      this.store.dispatch(this.dashActions.activateDashboard(true));
      this.router.navigate(['/dashboard']);
      this.closeSidenav();
  }

  navToSettings() {
      // call to the store to update activeComponent
      this.currentComponent = 'Settings';
      this.store.dispatch(this.dashActions.activateDashboard(false));
      this.router.navigate(['/settings']);
      this.closeSidenav();
  }

  openSidenav() {
    this.store.dispatch(this.navActions.toggleSidenav(true));
  }

  closeSidenav() {
    this.store.dispatch(this.navActions.toggleSidenav(false));
  }
}
