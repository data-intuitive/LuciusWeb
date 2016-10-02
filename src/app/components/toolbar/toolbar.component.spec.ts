/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { ToolbarComponent } from './toolbar.component';
import { reducer } from '../../reducers';

let comp: ToolbarComponent;
let fixture: ComponentFixture<ToolbarComponent>;
let el: DebugElement;

describe('App: LuciusWeb', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          StoreModule.provideStore(reducer)
        ],
        declarations: [
          ToolbarComponent
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ToolbarComponent);
        comp = fixture.componentInstance;
        el = fixture.debugElement;
      });
  }));

  it('should create toolbar', async(() => {
    expect(comp).toBeTruthy();
  }));

  it('toolbar type should exist', async(() => {
    expect(comp.type).toBe('');
  }));

});
