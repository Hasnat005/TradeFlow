import { Request, Response } from 'express';

import { getAuthContext } from '../middlewares/authenticate-jwt';
import { OrderStatus } from '../repositories/orders.repository';
import { OrdersService } from '../services/orders.service';

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  async createOrder(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as {
      supplierName: string;
      expectedDeliveryDate: string;
      notes?: string;
      status: OrderStatus;
      items: Array<{
        itemName: string;
        quantity: number;
        unitPrice: number;
      }>;
    };

    const data = await this.ordersService.createOrder(body, auth);

    res.status(201).json({
      success: true,
      data,
    });
  }

  async listOrders(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const query = req.query as { status?: OrderStatus };

    const data = await this.ordersService.listOrders(auth, query.status);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async getOrderById(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };

    const data = await this.ordersService.getOrderById(params.id, auth);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async updateOrder(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };
    const body = req.body as {
      supplierName?: string;
      expectedDeliveryDate?: string;
      notes?: string;
      items?: Array<{
        itemName: string;
        quantity: number;
        unitPrice: number;
      }>;
    };

    const data = await this.ordersService.updateOrder(params.id, body, auth);

    res.status(200).json({
      success: true,
      data,
    });
  }

  async updateOrderStatus(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };
    const body = req.body as { status: OrderStatus };

    const data = await this.ordersService.updateOrderStatus(params.id, body.status, auth);

    res.status(200).json({
      success: true,
      data,
    });
  }
}
