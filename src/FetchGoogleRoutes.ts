import * as path from 'path';
import * as dotenv from 'dotenv';
import {
  Client, Status, DirectionsRequest, DirectionsResponse,
} from '@googlemaps/google-maps-services-js';

const dotEnvPath = path.resolve('../.env');
dotenv.config({ path: dotEnvPath });

export interface FetchRoutesParams {
  orderedStops: Array<string>
  alternativeRoutes?: boolean
}

export default class FetchGoogleRoutes {
  googleAPIKey: string

  googleClient: Client;

  constructor(googleAPIKey: string, googleClient: Client) {
    this.fetchRoutes.bind(this);
    this.googleAPIKey = googleAPIKey;
    this.googleClient = googleClient;
  }

  private createDirectionsRequest = (routingRequest: FetchRoutesParams): DirectionsRequest => {
    try {
      // console.log("This: ", this);
      const { orderedStops } = routingRequest;
      const noOrderedStops = orderedStops.length;
      let params: DirectionsRequest['params'] = {
        origin: `place_id:${orderedStops[0]}`,
        destination: `place_id:${orderedStops[noOrderedStops - 1]}`,
        key: this.googleAPIKey,
      };
      if (noOrderedStops > 2) {
        const intermediateStops = orderedStops.slice(1, noOrderedStops - 1);
        const waypoints:string[] = intermediateStops.map((stop) => `place_id:${stop}`);
        params = {
          ...params,
          waypoints,
        };
      }
      if (routingRequest.alternativeRoutes !== undefined) {
        params = {
          ...params,
          alternatives: routingRequest.alternativeRoutes,
        };
      }
      // const waypoints
      return { params };
    } catch (error) {
      throw new Error(`Unable to create directions request. ${error.message}`);
    }
  }

  // eslint-disable-next-line consistent-return
  public async fetchRoutes(routingRequest: FetchRoutesParams): Promise<DirectionsResponse['data']> {
    // console.log("routingRequest: ", routingRequest);
    const fetchParams: DirectionsRequest = this.createDirectionsRequest(routingRequest);
    try {
      const r = await this.googleClient.directions(fetchParams);
      if (r.data.status === Status.OK) {
        return r.data;
      }
      if (r.data.status === Status.ZERO_RESULTS) {
        throw new Error('No Routes Found');
      }
    } catch (err) {
      if (err.message === 'No Routes Found') {
        throw err;
      } else {
        this.handleGoogleRejection(err);
      }
    }
  }

  private handleGoogleRejection = (rejection:
    {
      response: { status: any; data: any; };
    }): Error => {
    const rejectionResponse = {
      statusCode: rejection.response.status,
      statusReason: rejection.response.data.status,
      error_message: rejection.response.data.error_message,
    };
    throw new Error(`Google Client rejection: Code ${rejectionResponse.statusCode} (${rejectionResponse.statusReason}. ${rejectionResponse.error_message})`);
  }
}
