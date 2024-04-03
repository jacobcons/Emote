import express from 'express';
import { getUsersSchema } from '../schemas/users.schemas.js';
import {
  getUsers,
  getUser,
  updateUser,
} from '../controllers/users.controllers.js';
import {
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';

const router = express.Router();

router.route('/').get(validateQuery(getUsersSchema), getUsers);

router.route('/:id').all(validateIds('id')).get(getUser).patch(updateUser);
export default router;
