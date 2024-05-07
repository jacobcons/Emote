import express from 'express';
import 'express-async-errors';
import { router as authRouter } from './routers/auth.router.js';
import { router as usersRouter } from './routers/users.router.js';
import { router as postsRouter } from './routers/posts.router.js';
import { router as reactionsRouter } from './routers/reactions.router.js';
import { router as commentsRouter } from './routers/comments.router.js';
import { router as friendshipsRouter } from './routers/friendships.router.js';
import { router as friendRequestsRouter } from './routers/friendRequests.router.js';
import { uploadImage } from './handlers/uploadImage.handlers.js';
import { errorHandler, notFound } from './middlewares/errors.middlewares.js';
import morgan from 'morgan';
import { verifyToken } from './middlewares/auth.middlewares.js';
import { errors as celebrateErrorHandler } from 'celebrate';
import fileUpload from 'express-fileupload';
import { MAX_UPLOAD_SIZE_BYTES } from './constants.js';
import { translateTextToEmojis } from './handlers/translateTextToEmojis.handlers.js';
import Joi from 'joi';
import { validateQuery } from './middlewares/validation.middlewares.js';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import apiDocs from '../docs/apiDocs.json' with { type: 'json' };

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

app.use('/auth', authRouter);
// protected routes
app.use(verifyToken);
app.use('/users', usersRouter);
app.use(postsRouter);
app.use(reactionsRouter);
app.use(commentsRouter);
app.use(friendshipsRouter);
app.use('/friend-requests', friendRequestsRouter);
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
app.get(
  '/translate-text-to-emojis',
  validateQuery(Joi.object({ text: Joi.string().required() })),
  translateTextToEmojis,
);

app.use(notFound, celebrateErrorHandler(), errorHandler);

export { app };
