/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { reducers } from './reducers';
import { SettingsActions, LayoutActions } from './actions';
import { MaterialModule } from '@angular/material';

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;
let el: DebugElement;

describe('App: LuciusWeb', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([]),
          StoreModule.provideStore(reducers),
          MaterialModule
        ],
        declarations: [
          AppComponent
        ],
        providers: [
          SettingsActions,
          LayoutActions
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        comp = fixture.componentInstance;
        el = fixture.debugElement;
      });
  }));

  it('should create the app', async(() => {
    expect(comp).toBeTruthy();
  }));

  it('should have md-sidenav in md-sidenav-layout', async(() => {
    expect(el.query(By.css('md-sidenav-layout > md-sidenav'))).toBeTruthy();
  }));

});
