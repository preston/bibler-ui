import { BiblerUiPage } from './app.po';

describe('bibler-ui App', function() {
  let page: BiblerUiPage;

  beforeEach(() => {
    page = new BiblerUiPage();
  })

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('bibler-ui Works!');
  });
});
