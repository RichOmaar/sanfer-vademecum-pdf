import express from 'express';
import cors from 'cors';
import indexRoutes from './routes/index.js';

const app = express();

app.use(cors());

app.use(indexRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
