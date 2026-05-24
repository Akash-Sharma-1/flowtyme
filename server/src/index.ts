import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import calendarRouter from './routes/calendar';
import notionRouter from './routes/notion';
import slotsRouter from './routes/slots';
import pushRouter from './routes/push';
import configRouter from './routes/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/calendar', calendarRouter);
app.use('/api/notion', notionRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/push', pushRouter);
app.use('/api/config', configRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowtyme');
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
