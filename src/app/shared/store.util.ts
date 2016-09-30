import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { AppState } from '../reducers';

@Injectable()
export class StoreUtil {
  state: AppState;

  constructor(
    private store: Store<AppState>
  ) {
  }

  /* method to return current state of the store */
  getState(): AppState {
    this.store
      .take(1)
      .subscribe(s => this.state = s)
      .unsubscribe();

    return this.state;
  }
}
