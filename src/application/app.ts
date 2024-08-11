import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from '../middleware/errorMiddleware';
import { publicRouter } from '../routes/publicApi';
import { apiRouter } from '../routes/api';
dotenv.config()

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(publicRouter)
app.use(apiRouter)
app.use(errorMiddleware)
