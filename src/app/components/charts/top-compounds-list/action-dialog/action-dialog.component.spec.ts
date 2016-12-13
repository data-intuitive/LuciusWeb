/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';

import { ActionDialogComponent } from './action-dialog.component';

let component: ActionDialogComponent;
let fixture: ComponentFixture<ActionDialogComponent>;
let el: DebugElement;

describe('ActionDialogComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
      ],
      providers: [
        MdDialogRef
      ],
      declarations: [ ActionDialogComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ActionDialogComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
