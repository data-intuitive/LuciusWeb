import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import { HandleDataService } from '../../services/handle-data.service';
import { KnownTargets } from '../../models/known-targets';

@Component({
  selector: 'app-known-targets',
  templateUrl: './known-targets.component.html',
  styleUrls: ['./known-targets.component.scss']
})
export class KnownTargetsComponent implements OnInit {
  compound$: Observable<string>;
  knownTargets: KnownTargets;
  knownTargetsReady$: Observable<boolean>;

  constructor(
    private store: Store<fromRoot.State>,
    private handleDataService: HandleDataService
  ) {
    this.compound$ = this.store.let(fromRoot.getCompound);
    this.knownTargetsReady$ = this.store.let(fromRoot.getKnownTargetsReady);
  }

  ngOnInit() {
    this.knownTargetsReady$
      .subscribe(ev => {if (ev) {
        this.knownTargets = this.handleDataService
          .getData('knownTargets').result;
    }});
  }

}
