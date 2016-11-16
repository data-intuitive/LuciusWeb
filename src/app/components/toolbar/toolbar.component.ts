import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

import * as fromRoot from '../../reducers';
import * as layoutActions from '../../actions/layout';
import * as dataActions from '../../actions/data';
import * as fromSettings from '../../reducers/settings';

import { Settings } from '../../models/settings';
import { FetchDataService } from '../../services';
import { Parser } from '../../shared/parser';

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
    minChar = 1;
    showMe: boolean;

    constructor(
      private store: Store<fromRoot.State>,
      private fetchDataService: FetchDataService
    ) {
        this.signature$ = this.store.let(fromRoot.getSignature);
        this.compound$ = this.store.let(fromRoot.getCompound);
        this.settings$ = this.store.let(fromRoot.getSettings);

        this.comp.valueChanges
          .debounceTime(250)
          .distinctUntilChanged()
          .switchMap(term => this.search(term))
          .subscribe(result => {
            this.relatedCompounds = Parser.parseRelatedCompounds(result.data);
          });
    }

    ngOnInit() {
      this.settings$.subscribe(
        settings => { this.settings = settings; },
        err => console.log(err));

      this.showMe = !(this.type === 'settings');
    }

    // open side navigation bar by updating store, when menu button is pressed
    openSidenav() {
      this.store.dispatch(new layoutActions.OpenSidenavAction());
    }

    /* make REST API call for specific term from input */
    search(term: string): Observable<any> {
        let url = Parser.parseURL(this.settings, 'compounds');
        let data = {'compound': term, 'signature': ''};
        if (term.length < this.minChar) {
          console.log('zero length term!');
          data = {'compound': '1', 'signature': ''};
        }
        return this.fetchDataService.fetchData(url, data);
    }

    updateCompound(value: string) {
      this.store.dispatch(new dataActions.UpdateCompoundAction(value));
    }

    updateSignature(value: string) {
      this.store.dispatch(new dataActions.UpdateSignatureAction(value));
    }
}
