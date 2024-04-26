import express from 'express';
import 'express-async-errors';
import { router as authRouter } from './routers/auth.router.js';
import { router as usersRouter } from './routers/users.router.js';
import { router as postsRouter } from './routers/posts.router.js';
import { router as reactionsRouter } from './routers/reactions.router.js';
import { router as commentsRouter } from './routers/comments.router.js';
import { router as friendshipsRouter } from './routers/friendships.router.js';
import { uploadImage } from './handlers/uploadImage.handlers.js';
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
app.use(verifyToken, postsRouter);
app.use(verifyToken, reactionsRouter);
app.use(verifyToken, commentsRouter);
app.use(verifyToken, friendshipsRouter);
app.post(
  '/upload-image',
  fileUpload({
    useTempFiles: true,
    limits: {
      fileSize: MAX_UPLOAD_SIZE_BYTES,
      files: 1,
    },
  }),
  uploadImage,
);

app.use(notFound, celebrateErrorHandler(), errorHandler);

export { app };
