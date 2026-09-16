export type OrderStatus =
  | 'RECEIVED'
  | 'PACKING'
  | 'READY'
  | 'BILLED'
  | 'COMPLETED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Order Received',
  PACKING: 'Being Packed',
  READY: 'Ready for Pickup',
  BILLED: 'Bill Generated',
  COMPLETED: 'Completed'
};