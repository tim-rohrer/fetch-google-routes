import * as path from 'path';
import * as dotenv from 'dotenv';
import 'mocha';
import * as sinon from 'sinon';
import * as chai from 'chai';
import FetchGoogleRoutes, { FetchRoutesParams } from '../FetchGoogleRoutes';
import { Client, Status } from '@googlemaps/google-maps-services-js';
import directionsDataResult from './fixtures/directionsDataResult';

const dotEnvPath = path.resolve('/Users/tim/Programming/wanders/fetch-google-routes/.env');
dotenv.config({path: dotEnvPath});

const expect = chai.expect;

const googleAPIKeyFixture = process.env.GOOGLE_API_KEY;

let fetchGoogleRoutes: FetchGoogleRoutes;
let mockObj: any;
let testFunc: any;

const testClient = new Client();

describe('FetchGoogleRoute module', function() {

  describe('/constructor', function() {
    beforeEach(function() {
      testFunc = new FetchGoogleRoutes(googleAPIKeyFixture, testClient);
    })

    it('should confirm the module exists', function() {
      expect(FetchGoogleRoutes).to.be.a('function');
    })

    it('should confirm the module function returns an object', function() {
      expect(testFunc).to.be.a('object');
    })

    it('should accept and set the googleAPIKey', function() {
      expect(testFunc).to.haveOwnProperty('googleAPIKey');
      expect(testFunc.googleAPIKey).to.equal(googleAPIKeyFixture);
      expect(testFunc.googleAPIKey).not.to.be.undefined;
    })

  });

  describe('Method: fetchRoutes', function() {
    let fetch: { fetchRoutes: (arg0: FetchRoutesParams) => any; }

    beforeEach(function() {
      mockObj = sinon.stub(testClient, 'directions');
      fetch = new FetchGoogleRoutes(googleAPIKeyFixture, testClient);
    });

    afterEach(function() {
      mockObj.restore();
    })

    it('should return routes between two place_ids if status OK', async function() {
      mockObj.resolves(directionsDataResult);
      const fetchRequest: FetchRoutesParams = {
        orderedStops: ['ChIJK-0sC0Fl1oYRFccWTTgtw3M', 'ChIJgdL4flSKrYcRnTpP0XQSojM']
      };
      
      const actual = await fetch.fetchRoutes(fetchRequest);

      expect(actual.status).to.be.equal(Status.OK);
      expect(actual).to.be.equal(directionsDataResult.data);
    });

    it('should handle a geocoder_status of ZERO_RESULTS as an error', async function() {
      const noRoutes: any = {
        data: {
          geocoded_waypoints: [[Object], [Object]],
          routes: [],
          status: 'ZERO_RESULTS',
        }
      }
      const fetchRequest: FetchRoutesParams = {
        orderedStops: ['InvalidPLACE_ID', 'ChIJgdL4flSKrYcRnTpP0XQSojM']
      };

      mockObj.resolves(noRoutes);
      try {
        const actual = await fetch.fetchRoutes(fetchRequest)
        console.log("FAILED TEST! ", actual);
      } catch (error) {
        expect(error).to.be.an('error').with.property('message', "No Routes Found");
      }
    })
/** @todo Rewrite this test to confirm we get the reject status
 * messages back to the higher level.
 */
    it('should handle reject statuses from Google', async function() {
      const badResult = {
        Error: 'Dummy error trace',
        response: {
          status: 403,
          data: {
            error_message: 'Dummy error message',
            status: 'INVALID_REQUEST',
          }
        }
      }
      const fetchRequest: FetchRoutesParams = {
        orderedStops: ['InvalidPLACE_ID', 'ChIJgdL4flSKrYcRnTpP0XQSojM']
      };

      mockObj.rejects(badResult);
 
      try {
        const actual = await fetch.fetchRoutes(fetchRequest)
      } catch (error) {
        console.log(error.data);
        expect(error).to.be.an('error').with.property('message', 'Google Client rejection: Code 403 (INVALID_REQUEST. Dummy error message)');
      }
    });

  });
});
