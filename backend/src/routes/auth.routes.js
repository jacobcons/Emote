import express from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';
import { login, register, logout } from '../controllers/auth.controllers.js';
import { validateBody } from '../middlewares/validation.middlewares.js';

const router = express.Router();

router.route('/register').post(validateBody(registerSchema), register);

router.route('/login').post(validateBody(loginSchema), login);

router.route('/logout').post(logout);

export default router;
