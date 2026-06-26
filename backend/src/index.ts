import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import contentsRouter from './routes/contents';
import postsRouter from './routes/posts';
import analyticsRouter from './routes/analytics';
import brandRouter from './routes/brand';
import ideasRouter from './routes/ideas';
import aiRouter from './routes/ai';
import webhooksRouter from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 }, useTempFiles: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Social Media Autopilot AI', version: '1.0.0' }));

// Routes
app.use('/api/contents', contentsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/brand', brandRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/ai', aiRouter);
app.use('/api/webhooks', webhooksRouter);

app.listen(PORT, () => {
  console.log(`🚀 Social Media Autopilot AI running on port ${PORT}`);
  console.log(`📊 Supabase: ${process.env.SUPABASE_URL}`);
});

export default app;
