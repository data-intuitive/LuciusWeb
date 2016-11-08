/* tslint:disable:no-unused-variable */
import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as fromRoot from '../../../reducers';
import { HandleDataService } from '../../../services/handle-data.service';
import { Store } from '@ngrx/store';
import { Parser } from '../../../shared/parser';
import { Settings } from '../../../models/settings';

@Component({
  selector: 'app-similarity-scatter',
  templateUrl: './similarity-scatter.component.html',
  styleUrls: ['./similarity-scatter.component.scss']
})
export class SimilarityScatterComponent implements OnInit {
  zhangReady$: Observable<boolean>;
  // zhangArray: Array<Array<string>>;
  // zhangValues: Array<number>;
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
        const zhangArray = this.handleDataService.getData('zhang').result;
        const zhangValues = Parser.parseSimiliarityValues(zhangArray);
      }});
  }

}
