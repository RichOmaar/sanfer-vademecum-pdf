import express from 'express';
import indexRoutes from './routes/index.js';

const app = express();

app.use(indexRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
