import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { NavActions } from '../../actions/nav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(
    private store: Store<AppState>,
    private navActions: NavActions
  ) {

  }

  openSidenav() {
    this.store.dispatch(this.navActions.toggleSidenav(true));
  }
}
