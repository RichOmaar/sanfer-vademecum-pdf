// index.js in the root
import express from 'express';
import indexRoutes from './routes/index.js';

const app = express();

app.use(indexRoutes);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
