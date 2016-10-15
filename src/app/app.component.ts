import 'rxjs/add/operator/let';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import * as fromRoot from './reducers';
import * as layoutActions from './actions/layout';
import * as settingsActions from './actions/settings';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  showSidenav$: Observable<Boolean>;

  constructor(
    private store: Store<fromRoot.State>
  ) {
    this.showSidenav$ =
      store.let(fromRoot.getShowSidenav);
  }

  // on app load, initialize settings values by updating the store,
  // so other components can use them
  ngOnInit() {
    this.store.dispatch(new settingsActions.Init());
  }

  // close side navigation bar by updating the store
  closeSidenav() {
    this.store.dispatch(new layoutActions.CloseSidenavAction());
  }

}
