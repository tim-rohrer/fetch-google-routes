import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client, Status, DirectionsRequest } from '@googlemaps/google-maps-services-js';

const dotEnvPath = path.resolve('../.env');
dotenv.config({ path: dotEnvPath });

export interface FetchRoutesParams {
  orderedStops: Array<string>
  alternativeRoutes?: boolean
}

export default class FetchGoogleRoutes {
  googleClient: Client;

  constructor(googleClient: Client) {
    this.fetchRoutes.bind(this);
    this.googleClient = googleClient;
    // this.createDirectionsRequest = this.createDirectionsRequest.bind(this);
  }

  private getAPIKey = ():string => process.env.GOOGLE_API_KEY

  private createDirectionsRequest = (routingRequest: FetchRoutesParams): DirectionsRequest => {
    const key: string = this.getAPIKey();
    const { orderedStops } = routingRequest;
    const origin = `place_id:${orderedStops[0]}`;
    const noOrderedStops = orderedStops.length;
    const destination = `place_id:${orderedStops[noOrderedStops - 1]}`;
    let params: DirectionsRequest['params'] = {
      origin,
      destination,
      key,
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
  }

  public async fetchRoutes(routingRequest: FetchRoutesParams) {
    const fetchParams: DirectionsRequest = this.createDirectionsRequest(routingRequest);

    try {
      const r = await this.googleClient.directions(fetchParams);
      if (r.data.status === Status.OK) {
        return r.data;
      } if (r.data.status === Status.ZERO_RESULTS) {
        const err = 'No Routes Found';
        throw err;
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}
