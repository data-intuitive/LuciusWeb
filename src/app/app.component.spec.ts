/* tslint:disable:no-unused-variable */
/// <reference path="../../node_modules/@types/jasmine/index.d.ts"/>

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { AppComponent } from './app.component';
import 'rxjs/add/operator/let';
import { AppModule } from './';
import { APP_BASE_HREF } from '@angular/common';
import { Router } from '@angular/router';

class FakeRouter {
  navigateByUrl(url: string) {
    return url;
  }
}

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;
let el: DebugElement;

describe('App: LuciusWeb', () => {
  // FIXME: not working because of "<a routerLink=" in template
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule
      ],
      providers: [
        {provide: Router, useClass: FakeRouter},
        {provide: APP_BASE_HREF, useValue: '/'}
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      comp = fixture.debugElement.componentInstance;
      el = fixture.debugElement;
    });
  }));

  it('should create the app', async(() => {
    expect(el).toBeTruthy();
  }));

  // it('should have md-sidenav in md-sidenav-layout', async(() => {
  //  expect(el.query(By.css('md-sidenav-layout > md-sidenav'))).toBeTruthy();
  // }));

});
