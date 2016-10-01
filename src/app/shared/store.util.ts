import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../reducers';

@Injectable()
export class StoreUtil {

  // method to synchronously return current state of the store
  static getState(store: Store<fromRoot.State>): fromRoot.State {
    let state: fromRoot.State;

    store
      .take(1)
      .subscribe(s => state = s)
      .unsubscribe();

    return state;
  }
}
