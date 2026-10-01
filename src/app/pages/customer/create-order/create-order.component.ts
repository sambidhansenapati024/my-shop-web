import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { OrderItem } from '../../../models/order-item.model';
import { OrderDraftService } from '../../../services/order-draft.service';
import { OrderService } from '../../../services/order.service';

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
// PHOTO SCANNING
// ==========================================

isScanningPhoto = false;

scanCompleted = false;

detectedItems: OrderItem[] = [];


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
  private orderDraftService: OrderDraftService,
  private orderService: OrderService,
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

  scanPhoto(): void {

  if (
    !this.selectedPhoto ||
    !this.photoPreview
  ) {
    alert(
      'Please upload a grocery list photo.'
    );
    return;
  }

  this.isScanningPhoto = true;
  this.scanCompleted = false;
  this.detectedItems = [];

  this.orderService
    .scanGroceryPhoto(
      this.selectedPhoto
    )
    .subscribe({

      next: (response) => {

        console.log(
          'OCR response:',
          response
        );

        this.detectedItems =
          response.items.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit
          }));

        this.isScanningPhoto = false;
        this.scanCompleted = true;

        if (
          this.detectedItems.length === 0
        ) {

          alert(
            'No grocery items could be detected. Please try a clearer photo.'
          );
        }
      },

      error: (error) => {

        console.error(
          'OCR scanning failed:',
          error
        );

        this.isScanningPhoto = false;
        this.scanCompleted = false;

        alert(
          'Unable to scan the grocery list. Please try again.'
        );
      }

    });
}

hasInvalidDetectedItems(): boolean {

  if (
    !this.detectedItems ||
    this.detectedItems.length === 0
  ) {
    return true;
  }

  return this.detectedItems.some(item =>
    !item.itemName ||
    item.itemName.trim() === '' ||
    item.quantity === null ||
    item.quantity === undefined ||
    item.quantity <= 0 ||
    !item.unit ||
    item.unit.trim() === ''
  );
}

isDetectedItemInvalid(index: number): boolean {

  const item =
    this.detectedItems[index];

  if (!item) {
    return true;
  }

  return (
    !item.itemName ||
    item.itemName.trim() === '' ||
    item.quantity === null ||
    item.quantity === undefined ||
    item.quantity <= 0 ||
    !item.unit ||
    item.unit.trim() === ''
  );
}

removeDetectedItem(index: number): void {

  this.detectedItems.splice(index, 1);

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

  if (
    this.detectedItems.length === 0
  ) {
    alert(
      'No grocery items were detected. Please scan the photo again.'
    );
    return;
  }

  if (this.hasInvalidDetectedItems()) {
    alert(
      'Please check all detected items before continuing.'
    );
    return;
  }

  this.orderDraftService.savePhotoOrder(
    this.selectedPhoto,
    this.photoPreview,
    this.photoNote,
    this.detectedItems
  );

  this.router.navigate([
    '/app/order-review'
  ]);
}

}