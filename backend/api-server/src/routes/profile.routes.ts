import { Router } from 'express';

import { ProfileController } from '../controllers/profile.controller';
import { authenticateJwt } from '../middlewares/authenticate-jwt';
import { validateRequest } from '../middlewares/validate-request';
import { addBankBodySchema, changePasswordBodySchema, updateProfileBodySchema } from '../modules/profile';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProfileService } from '../services/profile.service';
import { asyncHandler } from '../utils/async-handler';

const profileRepository = new ProfileRepository();
const profileService = new ProfileService(profileRepository);
const profileController = new ProfileController(profileService);

export const profileRouter = Router();

profileRouter.use(authenticateJwt);

profileRouter.get('/', asyncHandler((req, res) => profileController.getProfile(req, res)));

profileRouter.patch(
  '/',
  validateRequest({ body: updateProfileBodySchema }),
  asyncHandler((req, res) => profileController.updateProfile(req, res)),
);

profileRouter.patch(
  '/password',
  validateRequest({ body: changePasswordBodySchema }),
  asyncHandler((req, res) => profileController.changePassword(req, res)),
);

profileRouter.post(
  '/bank',
  validateRequest({ body: addBankBodySchema }),
  asyncHandler((req, res) => profileController.addBankAccount(req, res)),
);

profileRouter.get('/documents', asyncHandler((req, res) => profileController.getDocuments(req, res)));
