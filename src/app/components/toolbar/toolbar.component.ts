import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

import * as fromRoot from '../../reducers';
import * as layoutActions from '../../actions/layout';
import * as dataActions from '../../actions/data';
import * as fromSettings from '../../reducers/settings';

import { Settings } from '../../models/settings';
import { CompoundDataService } from '../../services';
import { Parser } from '../../shared/parser';
import { APIEndpoints } from '../../shared/api-endpoints';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent implements OnInit {
    @Input() type: string = '';
    signature$: Observable<string>;
    compound$: Observable<string>;
    settings$: Observable<fromSettings.State>;

    relatedCompounds: string[];
    settings: Settings;
    comp = new FormControl();
    showMe: boolean;
    minChar = 1;

    constructor(
      private store: Store<fromRoot.State>,
      private compoundDataService: CompoundDataService
    ) {
        this.signature$ = this.store.let(fromRoot.getSignature);
        this.compound$ = this.store.let(fromRoot.getCompound);
        this.settings$ = this.store.let(fromRoot.getSettings);

        this.comp.valueChanges
          .debounceTime(250)
          .distinctUntilChanged()
          .switchMap(term => this.search(term))
          .subscribe(result => this.relatedCompounds = result.data);
    }

    ngOnInit() {
      this.settings$.subscribe(
        settings => this.settings = settings,
        err => console.log(err));

      /* check which page is currently active */
      this.showMe = !(this.type === 'settings');
    }

    /* open side navigation bar via the store, when 'menu' button is pressed */
    openSidenav() {
      this.store.dispatch(new layoutActions.OpenSidenavAction());
    }

    /* make REST API call for specific term from input */
    search(term: string): Observable<any> {
        let url = Parser.parseURL(this.settings, APIEndpoints.compounds);
        let data = term;

        if (data.length < this.minChar) {
          console.log('zero length term!');
          data = '1';
        }
        return this.compoundDataService.fetchData(url, data);
    }

    /* update current compound value in data store */
    updateCompound(value: string) {
      this.store.dispatch(new dataActions.UpdateCompoundAction(value));
    }

    /* update current signature value in data store */
    updateSignature(value: string) {
      this.store.dispatch(new dataActions.UpdateSignatureAction(value));
    }
}
