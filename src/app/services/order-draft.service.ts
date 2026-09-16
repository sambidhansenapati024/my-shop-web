import { Injectable } from '@angular/core';
import { OrderItem } from '../models/order-item.model';
import { OrderType } from '../models/order.model';

export interface OrderDraft {
  orderType: OrderType;
  items: OrderItem[];
  photo: File | null;
  photoPreview: string | null;
  photoNote: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderDraftService {

  private draft: OrderDraft = {
    orderType: 'manual',
    items: [],
    photo: null,
    photoPreview: null,
    photoNote: ''
  };

  getDraft(): OrderDraft {
    return this.draft;
  }

  saveManualOrder(items: OrderItem[]): void {
  this.draft = {
    orderType: 'manual',

    items: items.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit
    })),

    photo: null,
    photoPreview: null,
    photoNote: ''
  };
}

  savePhotoOrder(
    photo: File,
    photoPreview: string,
    photoNote: string
  ): void {

    this.draft = {
      orderType: 'photo',
      items: [],
      photo: photo,
      photoPreview: photoPreview,
      photoNote: photoNote
    };
  }

  clearDraft(): void {
    this.draft = {
      orderType: 'manual',
      items: [],
      photo: null,
      photoPreview: null,
      photoNote: ''
    };
  }
}