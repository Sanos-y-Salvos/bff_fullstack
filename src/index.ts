import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/routes';

dotenv.config();

const app = express();

app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(Number(port), () => {
  console.log(`BackForFrontend listening on port ${port}`);
});
