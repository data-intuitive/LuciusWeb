import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';

import { HandleDataService } from '../../services/handle-data.service';
import { Store } from '@ngrx/store';
import { Settings, Zhang, TargetHistogram } from '../../models';

import { Parser } from '../../shared/parser';
import { ApiEndpoints } from '../../shared/api-endpoints';

@Component({
  selector: 'app-similarity-charts',
  templateUrl: './similarity-charts.component.html',
  styleUrls: ['./similarity-charts.component.scss'],
})

export class SimilarityChartsComponent implements OnInit {
    @Input() settings: Settings;

    zhangReady$: Observable<boolean>;
    zhangResponse: Array<Array<string>>;
    zhangArray: Array<Zhang>;

    similarityHistogramReady$: Observable<boolean>;
    similarityHistogramResponse: Array<any>;
    similarityHistogramData: TargetHistogram;

    constructor(
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService) {

      // observe if Zhang Data has arrived from server
      this.zhangReady$ = this.store.let(fromRoot.getZhangReady);

      // observe if SimilarityHistogram Data has arrived from server
      this.similarityHistogramReady$ = this.store.
        let(fromRoot.getSimilaritiesHistReady);
    }

    ngOnInit() {
      this.zhangReady$.subscribe(
        value => {
          if (value) {
            this.zhangResponse = this.handleDataService.
              getData(ApiEndpoints.zhang).result;
            this.zhangArray = Parser.
              parseZhangData(this.zhangResponse);
          }},
        err => console.log(err));

    this.similarityHistogramReady$.subscribe(
      value => {
        if (value) {
          this.similarityHistogramResponse = this.handleDataService.
            getData(ApiEndpoints.targetHistogram).result;
          this.similarityHistogramData = Parser.
            parseSimilarityHistogramData(this.similarityHistogramResponse);
        }},
      err => console.log(err));
  }

}
