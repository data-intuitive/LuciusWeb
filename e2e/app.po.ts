import { browser, element, by } from 'protractor/globals';

export class TestDashboardPage {
  navigateTo(address = '/') {
    return browser.get(address);
  }

  getDashboard() {
    return element(by.css('app-root app-dashboard')).isPresent();
  }

  openSidenav() {
    return element(by.css('app-dashboard .menu-bt')).click();
  }

  closeSidenav() {
    return element(by.css('app-root .md-sidenav-backdrop')).click();
  }

  isSidenavOpen() {
    return element(by.css('app-root md-sidenav.md-sidenav-opened')).isPresent();
  }
}
