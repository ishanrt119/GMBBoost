import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes';
import authRoutes from './routes/authRoutes';
import businessRoutes from './routes/businessRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', reviewRoutes);
app.use('/api', authRoutes);
app.use('/api', businessRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Review Monitor API is running!' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

process.stdin.resume();

export default app;