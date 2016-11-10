import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AnnotatedPlatewellid } from '../../models';
import { Settings } from '../../models';
import { HandleDataService } from '../../services/handle-data.service';
import * as fromRoot from '../../reducers';
import { Store } from '@ngrx/store';
// import { Parser } from '../../shared/parser';
import { ApiEndpoints } from '../../shared/api-endpoints';

@Component({
  selector: 'app-top-compounds',
  templateUrl: './top-compounds.component.html',
  styleUrls: ['./top-compounds.component.scss']
})

export class TopCompoundsComponent implements OnInit {
    @Input() settings: Settings;
    zhangReady$: Observable<boolean>;
    annotatedPlatewellids$: Observable<boolean>;
    annotatedPlatewellids: any;
    topPositive: Array<Array<string>>;
    topNegative: Array<Array<string>>;
    numComps: number;
    // pwids: string;

    constructor(
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService
    ) {

      // observe if zhang has arrived from server
      this.zhangReady$ = this.store.let(fromRoot.getZhangReady);

      // observe if annotatedPlatewellids have arrived from server
      this.annotatedPlatewellids$ = this.store.let(fromRoot.getAnnotatedPlatewellidsReady);

    }

    ngOnInit() {
      this.zhangReady$.subscribe(
        ev => { this.handleZhangEvent(ev); },
        err => console.log(err)
      );

      this.annotatedPlatewellids$.
        subscribe(
          ev => { if (ev) {
            this.annotatedPlatewellids = this.handleDataService.
              getData(ApiEndpoints.annotatedPlateWellids); }},
          err => console.log(err));

      // get number of components
      this.numComps = +this.settings.topComps;
     }

     handleZhangEvent(ev): void {
         if (ev) {
           let zhangArray = this.handleDataService.getData(ApiEndpoints.zhang).result;
           this.topPositive = this.getTopPositive(zhangArray);
           this.topNegative = this.getTopNegative(zhangArray);
          //  this.pwids = Parser.parsePwids(zhangArray)
          //    .toString()
          //    .replace(/,/g , ' ');
         }
       }

      getTopPositive(zhangArray: Array<Array<string>>) {
        return zhangArray.slice(0, this.numComps);
      }

      getTopNegative(zhangArray: Array<Array<string>>) {
        return zhangArray.reverse().slice(0, this.numComps);
      }
   }
