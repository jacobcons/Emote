import express from 'express';
import { getUsersSchema, updateUserSchema } from '../schemas/users.schemas.js';
import {
  getUser,
  getUsers,
  updateCurrentUser,
} from '../controllers/users.controllers.js';
import {
  validateBody,
  validateIds,
  validateQuery,
} from '../middlewares/validation.middlewares.js';

const router = express.Router();

router.route('/').get(validateQuery(getUsersSchema), getUsers);

router
  .route('/me')
  .all(validateBody(updateUserSchema))
  .patch(updateCurrentUser);

router.route('/:id').all(validateIds('id')).get(getUser);

export default router;
