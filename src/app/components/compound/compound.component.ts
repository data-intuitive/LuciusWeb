import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as fromSettings from '../../reducers/settings';
import * as serverActions from '../../actions/server';

import { ManipulateDataService } from '../../services/manipulate-data.service';
import { Compound } from '../../models/compound';
import { Signature } from '../../models/signature';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})

export class CompoundComponent implements OnInit {
  settings$: Observable<fromSettings.State>;
  signatureFetched$: Observable<boolean>;
  compoundFetched$: Observable<boolean>;
  currentCompound: Compound;
  currentSignature: Signature;

  constructor(
    private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService
  ) {
      // observe settings for changes
      this.settings$ = this.store.let(fromRoot.getSettings);

      // observe data for changes
      this.signatureFetched$ = this.store.let(fromRoot.getSignatureFetched);
      this.compoundFetched$ = this.store.let(fromRoot.getCompoundFetched);
    }

  ngOnInit() {
    this.signatureFetched$.
      subscribe(ev => this.currentSignature = this.manipulateDataService.getData('signature'));
    this.compoundFetched$.
      subscribe(ev => this.currentCompound = this.manipulateDataService.getData('compounds'));
  }

  fetchData(queryClass: string) {
    this.store.dispatch(new serverActions.FetchAction(queryClass));
  }

}
