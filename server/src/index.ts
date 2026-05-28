import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { execSync } from 'child_process';

import { getConfig } from './services/category-mapper';
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
    console.warn('⚠️  MongoDB not found — using in-memory server. Run: brew services start mongodb-community');
    console.warn('⚠️  Config and proposals will reset on every restart until MongoDB is running.');
    return memServer.getUri();
  }
}

function killPort(port: number | string) {
  try {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
  } catch { /* ignore */ }
}

async function start() {
  try {
    const uri = await getMongoUri();
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }
    console.log('MongoDB connected');

    // Seed config from .flowtyme-config.json if MongoDB is empty (covers in-memory restarts)
    await getConfig();

    // Kill any stale process holding the port (nodemon restarts skip predev)
    killPort(PORT);
    await new Promise(r => setTimeout(r, 200));

    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
