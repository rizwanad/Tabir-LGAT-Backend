import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { PORT, NODE_ENV } from './config/env.js';
import authRouter from './routes/auth.routes.js';
import entryTestRouter from './routes/entrytest.route.js';
import errorMiddleware from './middlewares/error.middleware.js';
import connectToDatabase from './database/mongodb.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(errorMiddleware);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/admin', authRouter);
app.use('/api/entrytest', entryTestRouter);

// **Check database connection before starting server**
async function startServer() {
  try {
    await connectToDatabase();
    console.log(`✅ Database connected successfully in ${NODE_ENV} mode`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();

export default app;
