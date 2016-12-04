import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import { Store } from '@ngrx/store';

import { APIEndpoints } from '../../shared/api-endpoints';
import { Settings, AnnotatedPlatewellid, Zhang } from '../../models';
import { HandleDataService } from '../../services';

/* constants */
const pos = 'POSITIVE';
const neg = 'NEGATIVE';

@Component({
  selector: 'app-top-compounds',
  templateUrl: './top-compounds.component.html',
  styleUrls: ['./top-compounds.component.scss']
})

export class TopCompoundsComponent implements OnInit {
    @Input() settings: Settings;
    zhangReady$: Observable<boolean>;
    annotatedPlatewellidsReady$: Observable<boolean>;
    topPositiveAnnotatedPlatewellids: AnnotatedPlatewellid[] = Array();
    topNegativeAnnotatedPlatewellids: AnnotatedPlatewellid[] = Array();
    topPositiveCorrelations: Zhang[] = Array();
    topNegativeCorrelations: Zhang[] = Array();
    numComps: number;

    constructor(
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService
    ) {

      // observe if zhang has arrived from server
      this.zhangReady$ = this.store
        .let(fromRoot.getZhangReady);

      // observe if annotatedPlatewellids have arrived from server
      this.annotatedPlatewellidsReady$ = this.store
        .let(fromRoot.getAnnotatedPlatewellidsReady);
    }

    ngOnInit() {

      /* listen for Zhang data from the server */
      this.zhangReady$.subscribe(
        ev => this.handleZhangEvent(ev),
        err => console.log(err)
      );

      /* listen for annotatedPlatewellids data from the server */
      this.annotatedPlatewellidsReady$.subscribe(
        ev => this.handleAnnotatedPlateWellidsEvent(ev),
        err => console.log(err));

      /* get number of components as number */
      this.numComps = +this.settings.topComps;
     }

     handleZhangEvent(ev): void {
       if (ev) {
         let zhangArray = this.handleDataService.getData(APIEndpoints.zhang);

         this.topPositiveCorrelations = this.
           getTopCorrelations(zhangArray, pos);

         this.topNegativeCorrelations = this.
           getTopCorrelations(zhangArray, neg);
       }
     }

     handleAnnotatedPlateWellidsEvent(ev): void {
       if (ev) {
         let annotatedPlatewellidsArray = this.handleDataService.getData(APIEndpoints.annotatedPlateWellids);

         this.topPositiveAnnotatedPlatewellids = this.
          getTopAnnotatedPlateWellIds(annotatedPlatewellidsArray, pos);

        this.topNegativeAnnotatedPlatewellids = this.
           getTopAnnotatedPlateWellIds(annotatedPlatewellidsArray, neg);
       }
     }

    /* function to get top postive/negative correlations */
    getTopCorrelations(zhangArray: Zhang[], type: string): Zhang[] {
      let subArray: Zhang[] = Array();

      if (type === 'POSITIVE') {
        return subArray = zhangArray.
          slice(0, this.numComps);
      } else {
        return subArray = zhangArray.
          slice(zhangArray.length - this.numComps, zhangArray.length).
          reverse();
      }
    }

    /* function to get top postive/negative annotatedPlateWellIds */
    getTopAnnotatedPlateWellIds(annotatedPlatewellidsArray: AnnotatedPlatewellid[],
       type: string): AnnotatedPlatewellid[] {
      let subArray: AnnotatedPlatewellid[] = Array();

      if (type === 'POSITIVE') {
        return subArray = annotatedPlatewellidsArray.
          slice(0, this.numComps);
      } else {
        return subArray = annotatedPlatewellidsArray.
          slice(annotatedPlatewellidsArray.length - this.numComps, annotatedPlatewellidsArray.length).
          reverse();
      }
    }
}
