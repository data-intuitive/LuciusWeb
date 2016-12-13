import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';

import { Store } from '@ngrx/store';
import { HandleDataService } from '../../services';
import { Settings, TargetHistogram } from '../../models';
import { APIEndpoints } from '../../shared/api-endpoints';

@Component({
  selector: 'app-similarity-charts',
  templateUrl: './similarity-charts.component.html',
  styleUrls: ['./similarity-charts.component.scss'],
})

export class SimilarityChartsComponent implements OnInit {
    @Input() settings: Settings;

    binnedZhangReady$: Observable<boolean>;
    binnedZhangArray: any[] = Array();

    similarityHistogramReady$: Observable<boolean>;
    similarityHistogramData: TargetHistogram;

    constructor(
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService) {

      /* observe if Zhang Data has arrived from server */
      this.binnedZhangReady$ = this.store.let(
        fromRoot.getBinnedZhangReady);

      /* observe if SimilarityHistogram Data has arrived from server */
      this.similarityHistogramReady$ = this.store.let(
        fromRoot.getSimilaritiesHistReady);
    }

    ngOnInit() {
      this.binnedZhangReady$.subscribe(
        ev => this.handleBinnedZhangEvent(ev),
        err => console.log(err));

      this.similarityHistogramReady$.subscribe(
        ev => this.handleSimilarityHistogramEvent(ev),
        err => console.log(err));
    }

    handleBinnedZhangEvent(ev) {
      if (ev) {
        this.binnedZhangArray = this.handleDataService.
          getData(APIEndpoints.binnedZhang);
      }
    }

    handleSimilarityHistogramEvent(ev) {
      if (ev) {
        this.similarityHistogramData = this.handleDataService.
          getData(APIEndpoints.targetHistogram);
      }
    }
}
