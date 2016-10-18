import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as fromSettings from '../../reducers/settings';
import * as serverActions from '../../actions/server';
import * as dataActions from '../../actions/data';

import { ManipulateDataService } from '../../services/manipulate-data.service';
import { Signature } from '../../models/signature';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})

export class CompoundComponent implements OnInit {
  settings$: Observable<fromSettings.State>;
  signatureFetched$: Observable<boolean>;
  currentSignature: Signature;

  constructor(
    private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService
  ) {
      // observe settings for changes
      this.settings$ = this.store.let(fromRoot.getSettings);

      // observe signature for changes
      this.signatureFetched$ = this.store.let(fromRoot.getSignatureFetched);
    }

  ngOnInit() {
    this.signatureFetched$.
      subscribe(ev => {
        this.currentSignature = this.manipulateDataService.getData('signature');
        this.updateSignature(ev);
      });
  }

  fetchData(queryClass: string) {
    this.store.dispatch(new serverActions.FetchAction(queryClass));
  }

  updateSignature(updated) {
    // if signature is changed from input, update it in store
    if (updated === true) {
      let sig = this.currentSignature.result.toString();
      this.store.dispatch(new dataActions.UpdateSignatureAction(sig));
    }
  }

}
