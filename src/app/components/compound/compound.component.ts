import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../../reducers';
import * as fromSettings from '../../reducers/settings';
import * as serverActions from '../../actions/server';

import { ManipulateDataService } from '../../services/manipulate-data.service';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})
export class CompoundComponent implements OnInit {
  settings$: Observable<fromSettings.State>;
  data: JSON;

  constructor(
    private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService
  ) {
    // get latest settings values from the store
    this.settings$ = this.store.let(fromRoot.getSettings);
  }

  ngOnInit() {
    this.getData();
    // on app init, get data from server and consume when ready
    this.manipulateDataService.dataSaved
      .subscribe(event => this.data = this.manipulateDataService.getData());
  }

  getData() {
    this.store.dispatch(new serverActions.Fetch());
}

}
