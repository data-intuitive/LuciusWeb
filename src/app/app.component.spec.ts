/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

import { MdCoreModule } from '@angular2-material/core';
import { MdButtonModule } from '@angular2-material/button';
import { MdSidenavModule } from '@angular2-material/sidenav';
import { MdIconModule } from '@angular2-material/icon';

import { StoreModule } from '@ngrx/store';
import { reducers } from './reducers';
import { actions } from './actions';

describe('App: LuciusWeb', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        MdCoreModule,
        MdButtonModule,
        MdSidenavModule,
        MdIconModule,

        StoreModule.provideStore(
          reducers
        )
      ],
      providers: [
        actions
      ],
    });
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let element = fixture.debugElement.componentInstance;
    expect(element).toBeTruthy();
  }));

  it(`should have a sidenav`, async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let element = fixture.debugElement.nativeElement;
    expect(element.querySelector('md-sidenav-layout > md-sidenav')).toBeTruthy();
  }));
});
