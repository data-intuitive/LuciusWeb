import { TestDashboardPage } from './app.po';

describe('Test LuciusWeb App', function() {
  let page: TestDashboardPage;

  beforeEach(() => {
    page = new TestDashboardPage();
  });

  it('dashboard should be present', () => {
    page.navigateTo();
    expect(page.getDashboard()).toBe(true);
  });

  it('should open sidenav', () => {
    page.navigateTo('/dashboard');
    page.openSidenav();
    expect(page.isSidenavOpen()).toBe(true);
  });

  it('should close sidenav', () => {
    page.navigateTo('/dashboard');
    page.openSidenav();
    page.closeSidenav();
    expect(page.isSidenavOpen()).toBe(false);
  });

});
