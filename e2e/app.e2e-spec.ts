import { TestDashboardPage } from './app.po';

describe('Test LuciusWeb App', function() {
  let page: TestDashboardPage;

  beforeEach(() => {
    page = new TestDashboardPage();
  });

  it('sidebar should be present', () => {
    page.navigateTo();
    expect(page.getSidebar()).toBe(true);
  });
});
