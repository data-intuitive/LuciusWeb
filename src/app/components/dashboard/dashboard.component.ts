import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '../../reducers';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(
    private store: Store<AppState>,
  ) {

  }
}
