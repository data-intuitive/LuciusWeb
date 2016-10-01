import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as layoutActions from '../../actions/layout';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent {
  @Input() type: String = '';

  constructor(
    private store: Store<fromRoot.State>
  ) {
  }

  // open side navigation bar by updating store, when menu button is pressed
  openSidenav() {
    this.store.dispatch(new layoutActions.OpenSidenavAction());
  }

}
