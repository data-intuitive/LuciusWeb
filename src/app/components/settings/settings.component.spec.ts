/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { SettingsComponent } from './settings.component';
import { reducers } from '../../reducers';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { LayoutActions, SettingsActions } from '../../actions';
import { FormBuilder } from '@angular/forms';
import { StoreUtil } from '../../shared';

let comp: SettingsComponent;
let fixture: ComponentFixture<SettingsComponent>;
let el: DebugElement;

describe('App: LuciusWeb', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          StoreModule.provideStore(reducers)
        ],
        declarations: [
          SettingsComponent,
          ToolbarComponent
        ],
        providers: [
          LayoutActions,
          SettingsActions,
          FormBuilder,
          StoreUtil
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SettingsComponent);
        comp = fixture.componentInstance;
        el = fixture.debugElement;
      });
  }));

  it('should create settings', async(() => {
    expect(comp).toBeTruthy();
  }));

  it('toolbar type should be settings', async(() => {
    let toolbar = el.query(By.css('app-toolbar'));
    expect(toolbar.attributes['type']).toBe('settings');
  }));

});


