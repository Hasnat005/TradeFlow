import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate-request';
import { forgotPasswordBodySchema, loginBodySchema, registerBodySchema, signupBodySchema } from '../modules/auth';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post('/login', validateRequest({ body: loginBodySchema }), asyncHandler((req, res) => authController.login(req, res)));
authRouter.post('/register', validateRequest({ body: registerBodySchema }), asyncHandler((req, res) => authController.register(req, res)));
authRouter.post('/signup', validateRequest({ body: signupBodySchema }), asyncHandler((req, res) => authController.signup(req, res)));
authRouter.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordBodySchema }),
  asyncHandler((req, res) => authController.forgotPassword(req, res)),
);
