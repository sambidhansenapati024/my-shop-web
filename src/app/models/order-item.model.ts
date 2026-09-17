export interface OrderItem {

  id?: number;

  itemName: string;

  quantity: number | null;

  unit: string;

  unitPrice?: number | null;

  itemTotal?: number | null;

}