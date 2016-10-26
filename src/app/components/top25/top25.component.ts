import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import { AnnotatedPlatewellids } from '../../models';
import { ManipulateDataService } from '../../services/manipulate-data.service';
import { Store } from '@ngrx/store';
import { Parser } from '../../shared/parser';

@Component({
  selector: 'app-top25',
  templateUrl: './top25.component.html',
  styleUrls: ['./top25.component.scss']
})
export class Top25Component implements OnInit {
    zhangFetched$: Observable<boolean>;
    annotatedPlatewellids$: Observable<boolean>;
    annotatedPlatewellids: AnnotatedPlatewellids;
    top25Positive: Array<Array<string>>;
    top25Negative: Array<Array<string>>;
    // pwids: string;

    constructor(
      private store: Store<fromRoot.State>,
      private manipulateDataService: ManipulateDataService
    ) {

      // observe if zhang has arrived from server
      this.zhangFetched$ = this.store.let(fromRoot.getZhangFetched);

      this.annotatedPlatewellids$ = this.store.let(fromRoot.getAnnotatedPlatewellidsFetched);
    }

    ngOnInit() {
      this.zhangFetched$.
        subscribe(ev => this.handleZhangEvent(ev));

      this.annotatedPlatewellids$.
        subscribe(ev => this.annotatedPlatewellids = this.manipulateDataService.
          getData('annotatedplatewellids'));
     }

     handleZhangEvent(ev): void {
         if (ev) {
           let zhangArray = this.manipulateDataService.getData('zhang').result;
           this.top25Positive = this.getTop25Positive(zhangArray);
           this.top25Negative = this.getTop25Negative(zhangArray);
          //  this.pwids = Parser.parsePwids(zhangArray)
          //    .toString()
          //    .replace(/,/g , ' ');
         }
       }

      getTop25Positive(zhangArray: Array<Array<string>>) {
        return zhangArray.slice(0, 25);
      }

      getTop25Negative(zhangArray: Array<Array<string>>) {
        return zhangArray.reverse().slice(0, 25);
      }

   }
