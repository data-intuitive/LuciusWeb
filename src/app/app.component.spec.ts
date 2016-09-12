/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('App: TestLuciusWebApp', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    });
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have a sidenav`, async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.nativeElement;
    expect(app.querySelector(':host(md-sidenav-layout > md-sidenav)')).toBeTruthy();
  }));
});
