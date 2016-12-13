/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { TopCompoundsListComponent } from './top-compounds-list.component';
import { ActionDialogComponent } from './action-dialog/action-dialog.component';

let component: TopCompoundsListComponent;
let fixture: ComponentFixture<TopCompoundsListComponent>;
let el: DebugElement;

describe('TopCompoundsListComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MaterialModule.forRoot() ],
      providers: [ MdDialog ],
      declarations: [ TopCompoundsListComponent, ActionDialogComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(TopCompoundsListComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
