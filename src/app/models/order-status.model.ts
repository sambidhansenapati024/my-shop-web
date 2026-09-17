export type OrderStatus =
  | 'RECEIVED'
  | 'PACKING'
  | 'READY'
  | 'BILLED'
  | 'BILL_MODIFIED'
  | 'COMPLETED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Order Received',
  PACKING: 'Being Packed',
  READY: 'Ready for Pickup',
  BILLED: 'Bill Generated',
  BILL_MODIFIED: 'Bill Modified',
  COMPLETED: 'Completed'
};