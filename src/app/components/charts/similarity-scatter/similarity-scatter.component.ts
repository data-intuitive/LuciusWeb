/* tslint:disable:no-unused-variable */
import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../../reducers';
import { HandleDataService } from '../../../services/handle-data.service';
import { Settings } from '../../../models/settings';

@Component({
  selector: 'app-similarity-scatter',
  templateUrl: './similarity-scatter.component.html',
  styleUrls: ['./similarity-scatter.component.scss']
})
export class SimilarityScatterComponent implements OnInit {
  zhangReady$: Observable<boolean>;
  zhangArray: string[][] = Array();
  @Input() settings: Settings;

  constructor(
    private store: Store<fromRoot.State>,
    private handleDataService: HandleDataService) {

    // observe if zhang has arrived from server
    this.zhangReady$ = this.store.let(fromRoot.getZhangReady);
  }

  ngOnInit() {
    this.zhangReady$.
      subscribe(ev => {if (ev) {
        // zhang data has arrived from server
        this.zhangArray = this.handleDataService.getData('zhang');
      }});
  }

}
