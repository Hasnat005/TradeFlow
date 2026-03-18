import { AppError } from '../utils/app-error';
import { OrderStatus, OrdersRepository } from '../repositories/orders.repository';

type AuthContext = {
  userId: string;
  companyId: string;
};

type CreateOrderInput = {
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

type UpdateOrderInput = {
  supplierName?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items?: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async createOrder(input: CreateOrderInput, auth: AuthContext) {
    return this.ordersRepository.create({
      ...input,
      companyId: auth.companyId,
    });
  }

  async listOrders(auth: AuthContext, status?: OrderStatus) {
    return this.ordersRepository.findAllByCompany(auth.companyId, status);
  }

  async getOrderById(id: string, auth: AuthContext) {
    const order = await this.ordersRepository.findById(id, auth.companyId);

    if (!order) {
      throw new AppError(404, 'Purchase order not found', 'ORDER_NOT_FOUND');
    }

    return order;
  }

  async updateOrder(id: string, input: UpdateOrderInput, auth: AuthContext) {
    const existing = await this.getOrderById(id, auth);

    if (existing.status !== 'Draft') {
      throw new AppError(409, 'Only Draft orders can be edited', 'ORDER_EDIT_NOT_ALLOWED');
    }

    const updated = await this.ordersRepository.update({
      id,
      companyId: auth.companyId,
      ...input,
    });

    if (!updated) {
      throw new AppError(404, 'Purchase order not found', 'ORDER_NOT_FOUND');
    }

    return updated;
  }

  async updateOrderStatus(id: string, status: OrderStatus, auth: AuthContext) {
    const existing = await this.getOrderById(id, auth);

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      Draft: ['Sent', 'Rejected'],
      Sent: ['Accepted', 'Rejected'],
      Accepted: ['Delivered', 'Rejected'],
      Rejected: [],
      Delivered: ['Completed'],
      Completed: [],
    };

    if (!validTransitions[existing.status].includes(status) && existing.status !== status) {
      throw new AppError(
        409,
        `Cannot change status from ${existing.status} to ${status}`,
        'INVALID_ORDER_STATUS_TRANSITION',
      );
    }

    const updated = await this.ordersRepository.updateStatus({
      id,
      companyId: auth.companyId,
      status,
    });

    if (!updated) {
      throw new AppError(404, 'Purchase order not found', 'ORDER_NOT_FOUND');
    }

    return updated;
  }
}
