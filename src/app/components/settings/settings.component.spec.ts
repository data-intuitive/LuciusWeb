/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { reducer } from '../../reducers';

import { SettingsComponent } from './settings.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { CompoundDataService } from '../../services';

let comp: SettingsComponent;
let fixture: ComponentFixture<SettingsComponent>;
let el: DebugElement;

describe('SettingsComponent', () => {
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
          CompoundDataService,
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
