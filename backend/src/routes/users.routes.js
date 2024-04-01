import express from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';
import {
  getUsers,
  getUser,
  updateUser,
} from '../controllers/users.controllers.js';
import { validateBody } from '../middlewares/validation.middlewares.js';

const router = express.Router();

router.route('/').get(getUsers);

router.route('/:id').get(getUser).patch(updateUser);
export default router;
