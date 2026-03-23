import { Request, Response } from 'express';

import { getAuthContext } from '../middlewares/authenticate-jwt';
import { OrderStatus } from '../repositories/orders.repository';
import { OrdersService } from '../services/orders.service';

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  async createOrder(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const body = req.body as {
      supplierName?: string;
      supplier_name?: string;
      expectedDeliveryDate?: string;
      expected_delivery_date?: string;
      notes?: string;
      status: OrderStatus;
      items: Array<{
        itemName?: string;
        item_name?: string;
        quantity: number;
        unitPrice?: number;
        unit_price?: number;
      }>;
    };

    const data = await this.ordersService.createOrder(
      {
        supplierName: body.supplierName ?? body.supplier_name ?? '',
        expectedDeliveryDate: body.expectedDeliveryDate ?? body.expected_delivery_date ?? '',
        notes: body.notes,
        status: body.status,
        items: body.items.map((item) => ({
          itemName: item.itemName ?? item.item_name ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? item.unit_price ?? 0,
        })),
      },
      auth,
    );

    res.status(201).json({
      success: true,
      data,
    });
  }

  async listOrders(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const query = req.query as { status?: OrderStatus; search?: string; from?: string; to?: string };

    const data = await this.ordersService.listOrders(auth, {
      status: query.status,
      search: query.search,
      from: query.from,
      to: query.to,
    });

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
      supplier_name?: string;
      expectedDeliveryDate?: string;
      expected_delivery_date?: string;
      notes?: string;
      items?: Array<{
        itemName: string;
        item_name?: string;
        quantity: number;
        unitPrice: number;
        unit_price?: number;
      }>;
    };

    const data = await this.ordersService.updateOrder(
      params.id,
      {
        supplierName: body.supplierName ?? body.supplier_name,
        expectedDeliveryDate: body.expectedDeliveryDate ?? body.expected_delivery_date,
        notes: body.notes,
        items: body.items?.map((item) => ({
          itemName: item.itemName ?? item.item_name ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? item.unit_price ?? 0,
        })),
      },
      auth,
    );

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

  async convertOrderToInvoice(req: Request, res: Response) {
    const auth = getAuthContext(req);
    const params = req.params as { id: string };

    const data = await this.ordersService.convertOrderToInvoice(params.id, auth);

    res.status(200).json({
      success: true,
      data,
    });
  }
}
