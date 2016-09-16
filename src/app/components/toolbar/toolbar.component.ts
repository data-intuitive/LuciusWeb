import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';

import { AppState, getSidenavOpened } from '../../reducers';
import { LayoutActions } from '../../actions/layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
    activePage: String;
    sidenavOpen$: Observable<Boolean>;

  constructor(
    private store: Store<AppState>,
    private layoutActions: LayoutActions,
    private router: Router
) {
      this.activePage = '';
      this.sidenavOpen$ = store
        .let(getSidenavOpened());
  }

  openSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(true));
  }

  closeSidenav() {
    this.store.dispatch(this.layoutActions.toggleSidenav(false));
  }

  ngOnInit() {
      this.router.events.subscribe(ev => {let s = ev.url.substring(1);
                                          let path = s.charAt(0).toUpperCase() + s.slice(1);
                                          this.activePage = ((path !== 'Dashboard') && (path !== 'Settings')) ?
                                          'Dashboard' : path ;
                                         }
                                     );
      this.router.events.subscribe(ev => this.closeSidenav());
  }

}
