import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

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

  constructor(private store: Store<fromRoot.State>) {
  }

  ngOnInit() {
  }

  updateCompound(value: string) {
    this.compound = value;
    this.store.dispatch(new dataActions.UpdateCompoundAction(value));
  }

  updateSignature(value: string) {
    this.signature = value;
    this.store.dispatch(new dataActions.UpdateSignatureAction(value));
  }

}
