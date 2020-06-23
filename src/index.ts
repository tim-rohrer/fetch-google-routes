import * as path from 'path';
import * as dotenv from 'dotenv';
import app from './App';

const dotEnvPath = path.resolve('../.env');
dotenv.config({ path: dotEnvPath });

try {
  // const googleAPIKey = process.env.GOOGLE_API_KEY;
  const port = process.env.PORT || 3000;
  app.set('googleAPIKey', process.env.GOOGLE_API_KEY);
  app.listen(port, () => console.log(`server is listening on ${port}`)).on('error', (err) => console.log(err));
} catch (error) {
  throw new Error('Error starting Fetch Google Routes server.');
}
