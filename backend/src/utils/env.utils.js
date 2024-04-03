import dotenv from 'dotenv';
import { basePath } from './path.utils.js';
dotenv.config({
  path: basePath(`./.env.${process.env.NODE_ENV || 'development'}`),
});
