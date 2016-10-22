import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as fromSettings from '../../reducers/settings';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})

export class CompoundComponent implements OnInit {
  settings$: Observable<fromSettings.State>;

  constructor(
    private store: Store<fromRoot.State>,
  ) {
      // observe settings for changes
      this.settings$ = this.store.let(fromRoot.getSettings);
    }

  ngOnInit() {
  }

}
