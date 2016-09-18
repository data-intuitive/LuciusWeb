import { browser, element, by } from 'protractor/globals';

export class TestApp {
  navigateTo(address = '/') {
    return browser.get(address);
  }

  getRouteComp(comp: string) {
    return element(by.css(`app-root app-${comp}`)).isPresent();
  }

  openSidenav() {
    return element(by.css('app-toolbar .menu-bt')).click();
  }

  closeSidenav() {
    return element(by.css('app-root .md-sidenav-backdrop')).click();
  }

  isSidenavOpen() {
    return element(by.css('app-root md-sidenav.md-sidenav-opened')).isPresent();
  }
}
