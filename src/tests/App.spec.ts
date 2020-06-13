import { expect } from 'chai';
import app from '../App';


describe('App module', () => {
  describe('"app"', () => {
    it('should export a function', () => {
      expect(app).to.be.a('function');
    });
  });
});
