/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { addProviders, async, inject } from '@angular/core/testing';
import { KnownTargetsComponent } from './known-targets.component';

describe('Component: KnownTargets', () => {
  it('should create an instance', () => {
    let component = new KnownTargetsComponent();
    expect(component).toBeTruthy();
  });
});
