import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers';
import { LayoutActions } from '../../actions/layout';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent {
  @Input() type: String = '';

  constructor(
    private store: Store<AppState>,
    private layoutActions: LayoutActions
  ) {
  }

  /* open side navigation bar by updating store, when menu button is pressed */
  openSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(true));
  }

}
