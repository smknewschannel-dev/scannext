import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api-gateway', timestamp: new Date().toISOString() });
});

app.get('/dashboard', (_req, res) => {
  res.json({
    assets: 12,
    alertsOpen: 3,
    riskScore: 68,
    status: 'MVP demo payload'
  });
});

app.listen(port, () => {
  console.log(`API Gateway running on :${port}`);
});
