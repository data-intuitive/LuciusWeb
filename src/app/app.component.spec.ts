/* tslint:disable:no-unused-variable */
/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { MaterialModule } from '@angular/material';
import { AppComponent } from './app.component';
import { reducer } from './reducers';

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;
let el: DebugElement;

describe('LuciusWeb: AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([]),
          StoreModule.provideStore(reducer),
          MaterialModule
        ],
        declarations: [
          AppComponent
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
