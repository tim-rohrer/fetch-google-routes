import * as path from 'path';
import * as dotenv from 'dotenv';
import 'mocha';
import * as sinon from 'sinon';
// const assert = require('chai').assert;
import * as chai from 'chai';
// import { assert } from 'chai';
// import { expect } from 'chai';
import FetchGoogleRoutes, { FetchRoutesParams } from '../FetchGoogleRoutes';
import { Client } from '@googlemaps/google-maps-services-js';
import directionsDataResult from './fixtures/directionsDataResult';
// import directionsResponse from './fixtures/directionsResponse';

const dotEnvPath = path.resolve('/Users/tim/Programming/Projects/fetch-google-routes/.env');
dotenv.config({path: dotEnvPath});

const assert = chai.assert;
const expect = chai.expect;

const apiKeyFixture = process.env.GOOGLE_API_KEY;

let fetchGoogleRoutes: FetchGoogleRoutes;
let mockObj: any;

const testClient = new Client();

describe('FetchGoogleRoute module', function() {

  describe('/constructor', function() {

    it('should confirm the module exists', function() {
      expect(FetchGoogleRoutes).to.be.a('function');
    })

    it('should confirm the module function returns an object', function() {
      expect(new FetchGoogleRoutes(testClient)).to.be.a('object');
    })

    // it('should get the API key from the environment', function() {
    //   const fetch = new FetchGoogleRoutes(testClient);
    //   assert.equal(FetchGoogleRoutes.getAPIKey(), apiKeyFixture);
    // })

  });

  describe('Method: createDirectionsRequest', function() {
    let fetchProto: { createDirectionsRequest: (arg0: FetchRoutesParams) => any; }

    beforeEach(function() {
      fetchProto = Object.getPrototypeOf(new FetchGoogleRoutes(testClient));
    })
    it('should return origin, destination & waypoints in the orderedStops (place_ids) request', function() {
      const fetchRequest: FetchRoutesParams = {
        orderedStops: ['ChIJK-0sC0Fl1oYRFccWTTgtw3M','ChIJ7cv00DwsDogRAMDACa2m4K8','ChIJ7cv00DwsDogRAMDACa2m4K9', 'ChIJgdL4flSKrYcRnTpP0XQSojM']
      }
      const actual = fetchProto.createDirectionsRequest(fetchRequest);
      assert.deepEqual(actual, {
        params: {
          origin: 'place_id:ChIJK-0sC0Fl1oYRFccWTTgtw3M',
          destination: 'place_id:ChIJgdL4flSKrYcRnTpP0XQSojM',
          key: apiKeyFixture,
          waypoints: ['place_id:ChIJ7cv00DwsDogRAMDACa2m4K8','place_id:ChIJ7cv00DwsDogRAMDACa2m4K9']
        }
      })
    })
    it('should allow for explicit setting of alternative routing', function() {
      const fetchRequest: FetchRoutesParams = {
        orderedStops: ['ChIJK-0sC0Fl1oYRFccWTTgtw3M','ChIJ7cv00DwsDogRAMDACa2m4K8','ChIJ7cv00DwsDogRAMDACa2m4K9', 'ChIJgdL4flSKrYcRnTpP0XQSojM'],
        alternativeRoutes: true
      }
      const actual = fetchProto.createDirectionsRequest(fetchRequest);
      assert.deepEqual(actual, {
        params: {
          origin: 'place_id:ChIJK-0sC0Fl1oYRFccWTTgtw3M',
          destination: 'place_id:ChIJgdL4flSKrYcRnTpP0XQSojM',
          key: apiKeyFixture,
          waypoints: ['place_id:ChIJ7cv00DwsDogRAMDACa2m4K8','place_id:ChIJ7cv00DwsDogRAMDACa2m4K9'],
          alternatives: true
        }
      })
    })
  })

  describe('Method: fetchRoutes', function() {
    let fetch: { fetchRoutes: (arg0: FetchRoutesParams) => any; }

    beforeEach(function() {
      mockObj = sinon.stub(testClient, 'directions');
      fetch = new FetchGoogleRoutes(testClient);
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

      assert.equal(actual.status, "OK");
      assert.equal(actual, directionsDataResult.data);
    });

    it('should handle reject statuses from Google', async function() {
      const badResult = {
        data: {
          geocoded_waypoints: [[Object], [Object]],
          routes: [[Object]],
          status: 'INVALID_REQUEST',
        }
      }
      const fetchRequest: FetchRoutesParams = {
        orderedStops: ['InvalidPLACE_ID', 'ChIJgdL4flSKrYcRnTpP0XQSojM']
      };

      mockObj.rejects("INVALID_RESPONSE");
      try {
        const actual = await fetch.fetchRoutes(fetchRequest)
      } catch (e) {
        assert.equal(e,"Error: INVALID_RESPONSE")
      }
    });

    it('should handle a geocoder_status of ZERO_RESULTS', async function() {
      // Or this might work:
      // async function foo() {throw new Error("Foo");}
      // it("`foo` throws an async error (rejected Promise)", () => {
      //   return foo().catch(error => expect(error).to.be.an('error').with.property('message', 'Foo'))
      // });
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
      } catch (e) {
        assert.equal(e, "Error: No Routes Found");
      }
    })

  });
});
