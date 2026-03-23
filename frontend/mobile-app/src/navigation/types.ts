import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type InvoicesStackParamList = {
  InvoiceList: undefined;
  InvoiceDetail: { invoiceId: string };
  CreateInvoice: undefined;
};

export type FinancingStackParamList = {
  FinancingDashboard: undefined;
  FinancingRequest: { invoiceId?: string } | undefined;
  FinancingDetail: { requestId: string };
};

export type OrdersStackParamList = {
  OrdersDashboard: undefined;
  CreatePurchaseOrder:
    | {
        orderId?: string;
        initialValues?: {
          supplierName: string;
          expectedDeliveryDate: string;
          notes?: string;
          status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Delivered' | 'Completed';
          items: Array<{
            id: string;
            itemName: string;
            quantity: number;
            unitPrice: number;
          }>;
        };
      }
    | undefined;
  OrderDetail: { orderId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Invoices: NavigatorScreenParams<InvoicesStackParamList>;
  Financing: NavigatorScreenParams<FinancingStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
