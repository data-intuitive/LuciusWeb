/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { TopCompoundsComponent } from './top-compounds.component';
import { HandleDataService } from '../../services/handle-data.service';
import { reducer } from '../../reducers';

let comp: TopCompoundsComponent;
let fixture: ComponentFixture<TopCompoundsComponent>;
let el: DebugElement;

describe('TopCompoundsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          StoreModule.provideStore(reducer)
        ],
        providers: [
          HandleDataService
        ],
        declarations: [
          TopCompoundsComponent
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TopCompoundsComponent);
        comp = fixture.componentInstance;
        el = fixture.debugElement;
      });
  }));

  it('should create', () => {
    expect(comp).toBeTruthy();
  } );

});
