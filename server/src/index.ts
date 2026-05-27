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

async function getMongoUri(): Promise<string> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowtyme';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    return uri;
  } catch {
    mongoose.connection.close().catch(() => {});
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memServer = await MongoMemoryServer.create();
    console.warn('MongoDB not found — using in-memory server (data resets on restart)');
    return memServer.getUri();
  }
}

async function start() {
  try {
    const uri = await getMongoUri();
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
