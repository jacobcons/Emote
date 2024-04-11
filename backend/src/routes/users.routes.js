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
router.get('/', validateQuery(getUsersSchema), getUsers);
router.patch('/me', validateBody(updateUserSchema), updateCurrentUser);
router.get('/:id', validateIds('id'), getUser);
export default router;
