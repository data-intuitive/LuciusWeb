import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, getSettingsObject } from '../../reducers';
import { Observable } from 'rxjs/Observable';
import { SettingsObject } from '../../actions/settings';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})
export class CompoundComponent {
  settings$: Observable<SettingsObject>;

  constructor(private store: Store<AppState>) {
    this.settings$ = this.store.let(getSettingsObject());
    // this.foo$.subscribe(x => console.log(x));
  }

}
