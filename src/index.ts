import * as path from 'path';
import * as dotenv from 'dotenv';
import app from './App';

const dotEnvPath = path.resolve('../.env');
dotenv.config({ path: dotEnvPath });

const port = process.env.PORT || 3000;

app.listen(port, (err: any) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${port}`);
});
