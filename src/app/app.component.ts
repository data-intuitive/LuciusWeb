import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState,  } from './reducers';
import { LayoutActions } from './actions/layout';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private store: Store<AppState>,
    private layoutActions: LayoutActions
  ) { }
}
