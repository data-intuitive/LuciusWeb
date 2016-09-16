import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { AppState, getSidenavOpened, checkIfDashEnabled } from './reducers';
import { NavActions } from './actions/nav';
import { DashActions } from './actions/dash';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  sidenavOpen$: Observable<Boolean>;
  dashEnabled$: Observable<Boolean>;
  activePage$: Observable<String>;
  currentUrl: String;

  constructor(
    private store: Store<AppState>,
    private navActions: NavActions,
    private dashActions: DashActions,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // local variable for currentUrl
    this.currentUrl = '/';
    this.router.events.subscribe(ev => this.currentUrl = ev.url);
    console.log(this.currentUrl);

    // observable to use with async pipe - not working!
    this.activePage$ = route.url.map(x => x.join(''));

    this.sidenavOpen$ = store
      .let(getSidenavOpened());
    this.dashEnabled$ = store
      .let(checkIfDashEnabled());
  }

  // navToDasboard() {
  //     // call to the store to update activeComponent
  //     this.currentComponent = 'Dashboard';
  //     this.store.dispatch(this.dashActions.activateDashboard(true));
  //     this.router.navigate(['/dashboard']);
  //     this.closeSidenav();
  // }
  //
  // navToSettings() {
  //     // call to the store to update activeComponent
  //     this.currentComponent = 'Settings';
  //     this.store.dispatch(this.dashActions.activateDashboard(false));
  //     this.router.navigate(['/settings']);
  //     this.closeSidenav();
  // }



  openSidenav() {
    this.store.dispatch(this.navActions.toggleSidenav(true));
  }

  closeSidenav() {
    this.store.dispatch(this.navActions.toggleSidenav(false));
  }
}
