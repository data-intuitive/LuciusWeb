import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Compound } from '../../models/compound';
import { ManipulateDataService } from '../../services/manipulate-data.service';

import * as fromRoot from '../../reducers';
import * as dataActions from '../../actions/data';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  compound: string;
  signature: string;
  signature$: Observable<string>;
  compound$: Observable<string>;
  compoundFetched$: Observable<boolean>;
  relatedCompounds: Compound;

  constructor(
    private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService
  ) {
    this.signature$ = this.store.let(fromRoot.getSignature);
    this.compound$ = this.store.let(fromRoot.getCompound);
    this.compoundFetched$ = this.store.let(fromRoot.getCompoundFetched);
  }

  ngOnInit() {
    this.compoundFetched$.
      subscribe(ev => this.relatedCompounds = this.manipulateDataService.getData('compounds'));
  }

  updateCompound(value: string) {
    this.compound = value;
    this.store.dispatch(new dataActions.UpdateCompoundAction(value));
  }

  updateSignature(value: string) {
    this.signature = value;
    this.store.dispatch(new dataActions.UpdateSignatureAction(value));
    this.store.dispatch(new dataActions.UpdateCompoundAction(''));
  }

}
