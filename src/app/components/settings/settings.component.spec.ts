/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { SettingsComponent } from './settings.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { reducer } from '../../reducers';
import { FetchDataService } from '../../services/fetch-data.service';

let comp: SettingsComponent;
let fixture: ComponentFixture<SettingsComponent>;
let el: DebugElement;

describe('App: LuciusWeb', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          StoreModule.provideStore(reducer),
          HttpModule
        ],
        declarations: [
          SettingsComponent,
          ToolbarComponent
        ],
        providers: [
          FetchDataService,
          FormBuilder
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

  it('should have a filter search bar', async(() => {
    expect(el.query(By.css('app-toolbar'))).toBeTruthy();
  }));

  it('toolbar type should be settings', async(() => {
    let toolbar = el.query(By.css('app-toolbar'));
    expect(toolbar.attributes['type']).toBe('settings');
  }));

});
