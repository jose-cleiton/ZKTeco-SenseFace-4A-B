import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pino from 'pino';
import iclockRoutes from './routes/iclock.routes.ts';
import apiRoutes from './routes/api.routes.ts';
import panelRoutes from './routes/panel.routes.ts';

dotenv.config();

const logger = pino();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/iclock', iclockRoutes);
app.use('/api', apiRoutes);
app.use('/', panelRoutes);

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`ZKTeco PUSH Server running on http://0.0.0.0:${PORT}`);
});
