import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';

import { Store } from '@ngrx/store';
import { HandleDataService } from '../../services';
import { Settings, Zhang, TargetHistogram } from '../../models';
import { APIEndpoints } from '../../shared/api-endpoints';

@Component({
  selector: 'app-similarity-charts',
  templateUrl: './similarity-charts.component.html',
  styleUrls: ['./similarity-charts.component.scss'],
})

export class SimilarityChartsComponent implements OnInit {
    @Input() settings: Settings;

    zhangReady$: Observable<boolean>;
    zhangArray: Zhang[] = Array();

    similarityHistogramReady$: Observable<boolean>;
    similarityHistogramData: TargetHistogram;

    constructor(
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService) {

      /* observe if Zhang Data has arrived from server */
      this.zhangReady$ = this.store.let(fromRoot.getZhangReady);

      /* observe if SimilarityHistogram Data has arrived from server */
      this.similarityHistogramReady$ = this.store.
        let(fromRoot.getSimilaritiesHistReady);
    }

    ngOnInit() {
      this.zhangReady$.subscribe(
        ev => this.handleZhangEvent(ev),
        err => console.log(err));

      this.similarityHistogramReady$.subscribe(
        ev => this.handleSimilarityHistogramEvent(ev),
        err => console.log(err));
    }

    handleZhangEvent(ev) {
      if (ev) {
        this.zhangArray = this.handleDataService.
          getData(APIEndpoints.zhang);
      }
    }

    handleSimilarityHistogramEvent(ev) {
      if (ev) {
        this.similarityHistogramData = this.handleDataService.
          getData(APIEndpoints.targetHistogram);
      }
    }
}
