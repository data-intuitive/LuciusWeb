import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';

import { HandleDataService } from '../../services/handle-data.service';
import { Store } from '@ngrx/store';
import { Settings } from '../../models';
import { TargetHist } from '../../models';
// import { Parser } from '../../shared/parser';

@Component({
  selector: 'app-similarity-charts',
  templateUrl: './similarity-charts.component.html',
  styleUrls: ['./similarity-charts.component.scss'],
})

export class SimilarityChartsComponent implements OnInit {
    similaritiesHistogramReady$: Observable<boolean>;
    similaritiesHistogramData: TargetHist;
    @Input() settings: Settings;

    constructor(
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService) {

      // observe if similaritesHistogram has arrived from server
      this.similaritiesHistogramReady$ = this.store
        .let(fromRoot.getSimilaritiesHistReady);
    }

    ngOnInit() {
      this.similaritiesHistogramReady$.subscribe(
        value => {
          if (value) {
            this.similaritiesHistogramData = this.handleDataService
              .getData('targetHistogram');
            this.getHistProperties();
          }
        });
    }

    getHistProperties() {
      const bounds = this.similaritiesHistogramData.result.metadata.bounds;
      const data = this.similaritiesHistogramData.result.data;
      const zhang = this.similaritiesHistogramData.result.data.zhang;
      // const targets = Parser.parseTargetHistTargets(this.similaritiesHistogramData);
      console.log(bounds, data, zhang);
    }
}
