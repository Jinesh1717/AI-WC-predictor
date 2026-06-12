import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import teamRoutes from './routes/teamRoutes';
import playerRoutes from './routes/playerRoutes';
import matchRoutes from './routes/matchRoutes';
import predictRoutes from './routes/predictRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import { importData } from './data/seeder';
import { seedKaggle } from './data/seedKaggle';

// Connect to database
connectDB().then(async () => {
  // Import mock data if empty
  await importData();
  await seedKaggle();
});

import path from 'path';

// Routes
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predict', predictRoutes);

// Serve Static Frontend (Production Deployment)
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
