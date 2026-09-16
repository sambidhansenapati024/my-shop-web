import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { OrderItem } from '../../../models/order-item.model';
import { OrderDraftService } from '../../../services/order-draft.service';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent {

  // ==========================================
  // ORDER MODE
  // ==========================================

  orderMode: 'MANUAL' | 'PHOTO' = 'MANUAL';


  // ==========================================
  // MANUAL ORDER
  // ==========================================

  orderItems: OrderItem[] = [
    {
      itemName: '',
      quantity: null,
      unit: 'kg'
    }
  ];

  units: string[] = [
    'gm',
    'kg',
    'ml',
    'litre',
    'piece',
    'packet',
    'box',
    'dozen'
  ];


  // ==========================================
  // PHOTO ORDER
  // ==========================================

  selectedPhoto: File | null = null;

  photoPreview: string | null = null;

  photoNote = '';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private orderDraftService: OrderDraftService,
    private router: Router
  ) {}


  // ==========================================
  // ORDER MODE
  // ==========================================

  selectOrderMode(
    mode: 'MANUAL' | 'PHOTO'
  ): void {

    this.orderMode = mode;

  }


  // ==========================================
  // MANUAL ITEMS
  // ==========================================

  addItem(): void {

    this.orderItems.push({
      itemName: '',
      quantity: null,
      unit: 'kg'
    });

  }


  removeItem(index: number): void {

    if (this.orderItems.length === 1) {
      return;
    }

    this.orderItems.splice(index, 1);

  }


  get validItems(): OrderItem[] {

    return this.orderItems.filter(item =>
      item.itemName.trim() !== '' &&
      item.quantity !== null &&
      item.quantity > 0
    );

  }


  continueOrder(): void {

    if (this.validItems.length === 0) {

      alert(
        'Please add at least one item.'
      );

      return;
    }

    this.orderDraftService.saveManualOrder(
      this.validItems
    );

    this.router.navigate([
      '/app/order-review'
    ]);

  }


  // ==========================================
  // PHOTO SELECTION
  // ==========================================

  onPhotoSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {

      alert(
        'Please select an image file.'
      );

      input.value = '';

      return;
    }

    this.selectedPhoto = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.photoPreview =
        reader.result as string;

    };

    reader.readAsDataURL(file);

  }


  removePhoto(): void {

    this.selectedPhoto = null;

    this.photoPreview = null;

    this.photoNote = '';

  }


  replacePhoto(): void {

    const fileInput =
      document.getElementById(
        'photoInput'
      ) as HTMLInputElement;

    if (fileInput) {

      fileInput.click();

    }

  }


  continueWithPhoto(): void {

    if (
      !this.selectedPhoto ||
      !this.photoPreview
    ) {

      alert(
        'Please upload a grocery list photo.'
      );

      return;
    }

    this.orderDraftService.savePhotoOrder(
      this.selectedPhoto,
      this.photoPreview,
      this.photoNote
    );

    this.router.navigate([
      '/app/order-review'
    ]);

  }

}