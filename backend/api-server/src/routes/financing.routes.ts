import { Router } from 'express';

import { FinancingController } from '../controllers/financing.controller';
import { authenticateJwt } from '../middlewares/authenticate-jwt';
import { validateRequest } from '../middlewares/validate-request';
import { FinancingRepository } from '../repositories/financing.repository';
import { FinancingService } from '../services/financing.service';
import { asyncHandler } from '../utils/async-handler';
import {
  createFinancingRequestBodySchema,
  financingIdParamsSchema,
  financingListQuerySchema,
  updateFinancingStatusBodySchema,
} from '../modules/financing';

const financingRepository = new FinancingRepository();
const financingService = new FinancingService(financingRepository);
const financingController = new FinancingController(financingService);

export const financingRouter = Router();

financingRouter.use(authenticateJwt);

financingRouter.post(
  '/request',
  validateRequest({ body: createFinancingRequestBodySchema }),
  asyncHandler((req, res) => financingController.createRequest(req, res)),
);

financingRouter.get(
  '/',
  validateRequest({ query: financingListQuerySchema }),
  asyncHandler((req, res) => financingController.listRequests(req, res)),
);

financingRouter.get(
  '/:id',
  validateRequest({ params: financingIdParamsSchema }),
  asyncHandler((req, res) => financingController.getRequestById(req, res)),
);

financingRouter.patch(
  '/:id/status',
  validateRequest({ params: financingIdParamsSchema, body: updateFinancingStatusBodySchema }),
  asyncHandler((req, res) => financingController.updateStatus(req, res)),
);
