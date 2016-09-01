import { LuciusWebPage } from './app.po';

describe('lucius-web App', function() {
  let page: LuciusWebPage;

  beforeEach(() => {
    page = new LuciusWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
