import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';

import { HandleDataService } from '../../services/handle-data.service';
import { ApiEndpoints } from '../../shared/api-endpoints';
import { Parser } from '../../shared/parser';

@Component({
  selector: 'app-known-targets',
  templateUrl: './known-targets.component.html',
  styleUrls: ['./known-targets.component.scss']
})
export class KnownTargetsComponent implements OnInit {
  compound$: Observable<string>;
  knownTargets: Array<any>;
  knownTargetsResponse: Array<Array<string>>;
  knownTargetsReady$: Observable<boolean>;

  constructor(
    private store: Store<fromRoot.State>,
    private handleDataService: HandleDataService) {

    this.compound$ = this.store.let(fromRoot.getCompound);
    this.knownTargetsReady$ = this.store.let(fromRoot.getKnownTargetsReady);
  }

  ngOnInit() {
    this.knownTargetsReady$
      .subscribe(
        ev => { this.handleKnownTargetsEvent(ev); },
        err => console.log(err)
      );
  }

  handleKnownTargetsEvent(ev): void {
    if (ev) {
     this.knownTargetsResponse = this.handleDataService
       .getData(ApiEndpoints.knownTargets).result;
     this.knownTargets = Parser.parseKnownTargetsData(this.knownTargetsResponse);
    }
  }
}
