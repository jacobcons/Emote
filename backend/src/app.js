import express from 'express';
import 'express-async-errors';
import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/users.routes.js';
import { uploadImage } from './controllers/uploadImage.controllers.js';
import { errorHandler, notFound } from './middlewares/errors.middlewares.js';
import morgan from 'morgan';
import { verifyToken } from './middlewares/auth.middlewares.js';
import { errors as celebrateErrorHandler } from 'celebrate';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { MAX_UPLOAD_SIZE_BYTES } from './constants.js';

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', verifyToken, usersRouter);
app.post(
  '/upload-image',
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  }),
  uploadImage,
);

app.use(notFound, celebrateErrorHandler(), errorHandler);

export { app };
