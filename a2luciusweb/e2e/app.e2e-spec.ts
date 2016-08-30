import { A2luciuswebPage } from './app.po';

describe('a2luciusweb App', function() {
  let page: A2luciuswebPage;

  beforeEach(() => {
    page = new A2luciuswebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
