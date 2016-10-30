import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as layoutActions from '../../actions/layout';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent implements OnInit {
  @Input() type: string = '';
  showMe: boolean;

  constructor(
    private store: Store<fromRoot.State>
  ) {
  }

  // open side navigation bar by updating store, when menu button is pressed
  openSidenav() {
    this.store.dispatch(new layoutActions.OpenSidenavAction());
  }

  ngOnInit() {
    console.log(this.type);
    if (this.type === 'settings') {
      this.showMe = false;
    }else {
      this.showMe = true;
    }
  }

}
