import { browser, element, by } from 'protractor/globals';

export class TestDashboardPage {
  navigateTo() {
    return browser.get('/');
  }

  getSidebar() {
    return element(by.css('app-root > md-sidenav-layout > md-sidenav')).isPresent();
  }
}
