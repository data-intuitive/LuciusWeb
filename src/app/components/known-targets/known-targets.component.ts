import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import { ManipulateDataService } from '../../services/manipulate-data.service';
import { KnownTargets } from '../../models/known-targets';

@Component({
  selector: 'app-known-targets',
  templateUrl: './known-targets.component.html',
  styleUrls: ['./known-targets.component.scss']
})
export class KnownTargetsComponent implements OnInit {
  compound$: Observable<string>;
  knownTargets: KnownTargets;
  knownTargetsFetched$: Observable<boolean>;

  constructor(
    private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService
  ) {
    this.compound$ = this.store.let(fromRoot.getCompound);
    this.knownTargetsFetched$ = this.store.let(fromRoot.getKnownTargetsFetched);
  }

  ngOnInit() {
    this.knownTargetsFetched$
      .subscribe(ev => {if (ev) {
        this.knownTargets = this.manipulateDataService
          .getData('knownTargets').result;
    }});
  }

}
