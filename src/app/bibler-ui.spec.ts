import {describe, it, expect, beforeEachProviders, inject} from 'angular2/testing';
import {BiblerUiApp} from '../app/bibler-ui';

beforeEachProviders(() => [BiblerUiApp]);

describe('App: BiblerUi', () => {
  it('should have the `defaultMeaning` as 42', inject([BiblerUiApp], (app: BiblerUiApp) => {
    expect(app.defaultMeaning).toBe(42);
  }));

  describe('#meaningOfLife', () => {
    it('should get the meaning of life', inject([BiblerUiApp], (app: BiblerUiApp) => {
      expect(app.meaningOfLife()).toBe('The meaning of life is 42');
      expect(app.meaningOfLife(22)).toBe('The meaning of life is 22');
    }));
  });
});

