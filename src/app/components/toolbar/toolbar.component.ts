import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { LayoutActions } from '../../actions/layout';
import { Router } from '@angular/router';
import { Input } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent implements OnInit {
    @Input() type: String = '';

  constructor(
    private store: Store<AppState>,
    private layoutActions: LayoutActions,
    private router: Router
) {}

  openSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(true));
  }

  ngOnInit() {

  }

}
