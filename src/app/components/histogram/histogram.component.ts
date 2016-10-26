import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';

import { ManipulateDataService } from '../../services/manipulate-data.service';
import { Store } from '@ngrx/store';
import { Settings } from '../../models/settings';
// import { Parser } from '../../shared/parser';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit {
  similaritiesHistogramFetched$: Observable<boolean>;
  similaritiesHistogram: any;
  @Input() settings: Settings;

  constructor(
    private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService) {

    // observe if similaritesHistogram has arrived from server
    this.similaritiesHistogramFetched$ = this.store
      .let(fromRoot.getSimilaritiesHistFetched);
  }

  ngOnInit() {
    this.similaritiesHistogramFetched$.
      subscribe(ev => {if (ev) {
        this.similaritiesHistogram = this.manipulateDataService
          .getData('targetHistogram').result;
        // parser
      }});
   }
}
