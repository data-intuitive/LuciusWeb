import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as fromRoot from '../../reducers';
import { ManipulateDataService } from '../../services/manipulate-data.service';
import { Store } from '@ngrx/store';
import { Parser } from '../../shared/parser';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})
export class PlotComponent implements OnInit {
  zhangFetched$: Observable<boolean>;
  zhangArray: Array<Array<string>>;
  zhangValues: Array<number>;

  constructor(
    private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService) {

    // observe if zhang has arrived from server
    this.zhangFetched$ = this.store.let(fromRoot.getZhangFetched);
  }

  ngOnInit() {
    this.zhangFetched$.
      subscribe(ev => {if (ev) {
        this.zhangArray = this.manipulateDataService.getData('zhang').result;
        this.zhangValues = Parser.parseSimiliarityValues(this.zhangArray);
      }});
  }

}
