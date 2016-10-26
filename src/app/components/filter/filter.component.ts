import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Compound } from '../../models/compound';
import { Settings } from '../../models/settings';
import { FetchDataService } from '../../services/fetch-data.service';
import { Parser } from '../../shared/parser';

import * as fromRoot from '../../reducers';
import * as dataActions from '../../actions/data';
import * as fromSettings from '../../reducers/settings';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
    signature$: Observable<string>;
    compound$: Observable<string>;
    settings$: Observable<fromSettings.State>;
    relatedCompounds: Compound;
    relatedCompoundsArray: Array<string>;
    settings: Settings;
    comp = new FormControl();

    constructor(
      private store: Store<fromRoot.State>,
      private fetchDataService: FetchDataService
      ) {
        this.signature$ = this.store.let(fromRoot.getSignature);
        this.compound$ = this.store.let(fromRoot.getCompound);
        this.settings$ = this.store.let(fromRoot.getSettings);

        this.comp.valueChanges
          .debounceTime(200)
          .distinctUntilChanged()
          .switchMap(term => this.search(term))
          .subscribe(result =>
            this.relatedCompoundsArray = Parser.parseRelatedCompounds(result.data));
      }

      ngOnInit() {
          this.settings$.subscribe(settings => this.settings = settings);
      }

      search(term: string): Observable<any> {
        let url = Parser.parseURL(this.settings, 'compounds');
        let data = {'compound': term, 'signature': ''};
        return this.fetchDataService.fetchData(url, data);
      }

      updateCompound(value: string) {
        this.store.dispatch(new dataActions.UpdateCompoundAction(value));
      }

      updateSignature(value: string) {
        this.store.dispatch(new dataActions.UpdateSignatureAction(value));
      }
}
