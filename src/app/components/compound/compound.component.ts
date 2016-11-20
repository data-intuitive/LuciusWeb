import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as fromSettings from '../../reducers/settings';
import * as dataActions from '../../actions/data';

import { Settings } from '../../models/settings';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})

export class CompoundComponent implements OnInit {
  settings$: Observable<fromSettings.State>;
  signature$: Observable<string>;
  settings: Settings;

  constructor(
    private store: Store<fromRoot.State>
  ) {
      // observe settings for changes
      this.settings$ = this.store.let(fromRoot.getSettings);

      // observe signature for changes
      this.signature$ = this.store.let(fromRoot.getSignature);
    }

  ngOnInit() {
    this.settings$.subscribe(
      settings => this.settings = settings,
      err => console.log(err));

    this.signature$.subscribe(
      value => this.store.dispatch(new dataActions.UpdateSignatureAction(value)),
      err => console.log(err));
  }

}
