import express from 'express';
import { getUsersSchema } from '../schemas/users.schemas.js';
import {
  getUsers,
  getUser,
  updateUser,
} from '../controllers/users.controllers.js';
import { validateQuery } from '../middlewares/validation.middlewares.js';

const router = express.Router();

router.route('/').get(validateQuery(getUsersSchema), getUsers);

router.route('/:id').get(getUser).patch(updateUser);
export default router;
