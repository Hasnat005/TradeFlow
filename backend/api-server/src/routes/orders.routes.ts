import { Router } from 'express';

import { OrdersController } from '../controllers/orders.controller';
import { authenticateJwt } from '../middlewares/authenticate-jwt';
import { validateRequest } from '../middlewares/validate-request';
import {
  createOrderBodySchema,
  orderIdParamsSchema,
  orderListQuerySchema,
  updateOrderBodySchema,
  updateOrderStatusBodySchema,
} from '../modules/orders';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrdersService } from '../services/orders.service';
import { asyncHandler } from '../utils/async-handler';

const ordersRepository = new OrdersRepository();
const ordersService = new OrdersService(ordersRepository);
const ordersController = new OrdersController(ordersService);

export const ordersRouter = Router();

ordersRouter.use(authenticateJwt);

ordersRouter.post(
  '/',
  validateRequest({ body: createOrderBodySchema }),
  asyncHandler((req, res) => ordersController.createOrder(req, res)),
);

ordersRouter.get(
  '/',
  validateRequest({ query: orderListQuerySchema }),
  asyncHandler((req, res) => ordersController.listOrders(req, res)),
);

ordersRouter.get(
  '/:id',
  validateRequest({ params: orderIdParamsSchema }),
  asyncHandler((req, res) => ordersController.getOrderById(req, res)),
);

ordersRouter.patch(
  '/:id',
  validateRequest({ params: orderIdParamsSchema, body: updateOrderBodySchema }),
  asyncHandler((req, res) => ordersController.updateOrder(req, res)),
);

ordersRouter.patch(
  '/:id/status',
  validateRequest({ params: orderIdParamsSchema, body: updateOrderStatusBodySchema }),
  asyncHandler((req, res) => ordersController.updateOrderStatus(req, res)),
);

ordersRouter.post(
  '/:id/convert-to-invoice',
  validateRequest({ params: orderIdParamsSchema }),
  asyncHandler((req, res) => ordersController.convertOrderToInvoice(req, res)),
);
