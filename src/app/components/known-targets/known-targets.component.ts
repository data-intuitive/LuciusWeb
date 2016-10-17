import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../reducers';

@Component({
  selector: 'app-known-targets',
  templateUrl: './known-targets.component.html',
  styleUrls: ['./known-targets.component.scss']
})
export class KnownTargetsComponent implements OnInit {
  compound$: Observable<string>;

  constructor(private store: Store<fromRoot.State>) { }

  ngOnInit() {
    this.compound$ = this.store.let(fromRoot.getCompound);
  }

}
