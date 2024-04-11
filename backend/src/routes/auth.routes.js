import express from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';
import { login, register, logout } from '../controllers/auth.controllers.js';
import { validateBody } from '../middlewares/validation.middlewares.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);

router.post('/login', validateBody(loginSchema), login);

router.post('/logout', logout);

export default router;
