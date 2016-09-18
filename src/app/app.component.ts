import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';
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
      private layoutActions: LayoutActions
  ) {
    this.sidenavOpen$ =
        store.let(getSidenavOpened());
  }

  closeSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(false));
  }

}
