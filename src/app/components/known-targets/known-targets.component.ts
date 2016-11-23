import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';

import { HandleDataService } from '../../services';
import { APIEndpoints } from '../../shared/api-endpoints';

@Component({
  selector: 'app-known-targets',
  templateUrl: './known-targets.component.html',
  styleUrls: ['./known-targets.component.scss']
})

export class KnownTargetsComponent implements OnInit {
  compound$: Observable<string>;
  compound: string;
  knownTargets: any[] = Array();
  knownTargetsResponse: string[][] = Array();
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
        ev => this.handleKnownTargetsEvent(ev),
        err => console.log(err)
      );

    this.compound$
      .subscribe(
        data => this.compound = data,
        err => console.log(err)
      );
  }

  handleKnownTargetsEvent(ev): void {
    if (ev) {
     this.knownTargets = this.handleDataService
       .getData(APIEndpoints.knownTargets);
    }
  }
}
