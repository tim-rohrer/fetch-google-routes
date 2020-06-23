import express from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import FetchGoogleRoutes from './FetchGoogleRoutes';

class App {
  public express: express.Application;

  public fetch: FetchGoogleRoutes;

  constructor() {
    this.express = express();
    this.mountRoutes();
  }

  private mountRoutes(): void {
    const router = express.Router();
    router.post('/fetch', async (req, res, next) => {
      try {
        const results = await new FetchGoogleRoutes(this.express.get('googleAPIKey'), new Client()).fetchRoutes(req.body);
        res.json(results);
      } catch (error) {
        next(error);
      }
    });
    this.express.use(express.json());
    this.express.use('/api', router);
    this.express.use((error: Error, req: any, res: any, next: any) => {
      console.log('Server error: ', error);
      res.status(500)
        .send(`An unexpected server error occurred: ${error.message}`);
    });
  }
}

export default new App().express;
