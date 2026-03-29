import { Router } from 'express';

import { InvoicesController } from '../controllers/invoices.controller';
import { authenticateJwt } from '../middlewares/authenticate-jwt';
import { validateRequest } from '../middlewares/validate-request';
import {
  createInvoiceBodySchema,
  createInvoiceFromOrderBodySchema,
  invoiceIdParamsSchema,
  invoiceListQuerySchema,
  updateInvoiceStatusBodySchema,
} from '../modules/invoices';
import { InvoicesRepository } from '../repositories/invoices.repository';
import { InvoicesService } from '../services/invoices.service';
import { asyncHandler } from '../utils/async-handler';

const invoicesRepository = new InvoicesRepository();
const invoicesService = new InvoicesService(invoicesRepository);
const invoicesController = new InvoicesController(invoicesService);

export const invoicesRouter = Router();

invoicesRouter.use(authenticateJwt);

invoicesRouter.get(
  '/',
  asyncHandler((req, res) => invoicesController.listInvoices(req, res)),
);

invoicesRouter.post(
  '/',
  validateRequest({ body: createInvoiceBodySchema }),
  asyncHandler((req, res) => invoicesController.createInvoice(req, res)),
);

invoicesRouter.get(
  '/:id',
  validateRequest({ params: invoiceIdParamsSchema }),
  asyncHandler((req, res) => invoicesController.getInvoiceById(req, res)),
);

invoicesRouter.patch(
  '/:id/status',
  validateRequest({ params: invoiceIdParamsSchema, body: updateInvoiceStatusBodySchema }),
  asyncHandler((req, res) => invoicesController.updateStatus(req, res)),
);

invoicesRouter.post(
  '/from-order',
  validateRequest({ body: createInvoiceFromOrderBodySchema }),
  asyncHandler((req, res) => invoicesController.createFromOrder(req, res)),
);
