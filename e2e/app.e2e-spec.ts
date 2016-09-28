/// <reference path="../node_modules/@types/jasmine/index.d.ts"/>

import { TestApp } from './app.po';

describe('Test LuciusWeb', function () {
  let page: TestApp;

  beforeEach(() => {
    page = new TestApp();
  });

  it('compound should be present', () => {
    let route = 'compound';
    page.navigateTo('/' + route);
    expect(page.getRouteComp(route)).toBe(true);
  });

  it('should open sidenav', () => {
    page.navigateTo('/');
    page.openSidenav();
    browser.sleep(500);
    expect(page.isSidenavOpen()).toBe(true);
  });

  it('should close sidenav', () => {
    page.navigateTo('/');
    page.openSidenav();
    page.closeSidenav();
    browser.sleep(500);
    expect(page.isSidenavOpen()).toBe(false);
  });

  it('settings should be present', () => {
    let route = 'settings';
    page.navigateTo('/' + route);
    expect(page.getRouteComp(route)).toBe(true);
  });

});
