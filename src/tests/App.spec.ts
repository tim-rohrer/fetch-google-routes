import * as chai from 'chai';
import * as sinon from 'sinon';
import request from 'supertest';
import app from '../App';
import * as fixtures from './fixtures/fixtures';
import FetchGoogleRoutes from '../FetchGoogleRoutes';
const expect = chai.expect;

let mockFetchRoutes: any;

describe('App module', function() {

  describe('"app"', function() {

    describe('unmocked FetchGoogleRoutes', function() {

      it('should export a function', () => {
        expect(app).to.be.a('function');
      });
      it('should handle situation with invalid paramerters', async function() {
        const res = await request(app)
        .post('/api/fetch')
        .send({})
        .set('Accept', 'application/json');
        // console.log("Response analysis: ",res.text)
        expect(res.status).to.equal(500);
        expect(res.text).to.include("Error creating directions request.");
      })

    })

    describe('with mocked FetchGoogleRoutes', function() {

      beforeEach(function() {
        mockFetchRoutes = sinon.stub(FetchGoogleRoutes.prototype, 'fetchRoutes');
      });
  
      afterEach(function() {
        mockFetchRoutes.restore();
      })

      it('should respond with a proper Google directionsResponse', async function() {
        mockFetchRoutes.resolves(fixtures.fetchGoogleRoutesResults);
        const res = await request(app)
        .post('/api/fetch')
        .send(fixtures.directionsRequest)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('geocoded_waypoints')
        expect(res.body).to.have.property('status')
        expect(res.body.routes).to.not.be.null;
      })
  
      it('should handle situation of ZERO_RESULTS from fetchRoutes', async function() {
        mockFetchRoutes.throws(new Error("No Routes Found"));
  
        const res = await request(app)
        .post('/api/fetch')
        expect(res.status).to.equal(500);
        expect(res.text).to.equal("An unexpected server error occurred: No Routes Found");
      })

    })
  });
});
