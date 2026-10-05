import { Component, OnInit } from '@angular/core';
import { InventoryService, Product, ProductBatch } from '../../../services/inventory.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BarcodeScannerComponent } from '../../../shared/barcode-scanner/barcode-scanner.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, BarcodeScannerComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {

  products: Product[] = [];

  selectedProduct: Product | null = null;
  selectedProductBatches: ProductBatch[] = [];

  isLoading = false;
  isLoadingBatches = false;
  showProductForm = false;
  showBatchForm = false;

batchForm: FormGroup;

isSavingBatch = false;

productForm: FormGroup;

isSavingProduct = false;

showBarcodeScanner = false;

scannerMode: 'LOOKUP' | 'PRODUCT_FORM' = 'LOOKUP';

  constructor(
  private inventoryService: InventoryService,
  private fb: FormBuilder
) {
  this.productForm = this.fb.group({
    productName: [
      '',
      [
        Validators.required,
        Validators.maxLength(200)
      ]
    ],

    barcode: [
      '',
      Validators.maxLength(100)
    ],

    unit: [
      'piece',
      [
        Validators.required,
        Validators.maxLength(30)
      ]
    ]
  });

  this.batchForm = this.fb.group({
    batchNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    purchasePrice: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    sellingPrice: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    quantity: [
      null,
      [
        Validators.required,
        Validators.min(0.001)
      ]
    ],

    expiryDate: [
      null
    ]
  });
}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {

    this.isLoading = true;

    this.inventoryService
      .getAllProducts()
      .subscribe({
        next: (products) => {
          this.products = products;
          this.isLoading = false;
        },

        error: (error) => {
          console.error(
            'Failed to load inventory products:',
            error
          );

          this.isLoading = false;

          alert(
            'Unable to load inventory products.'
          );
        }
      });
  }

  selectProduct(product: Product): void {

    this.selectedProduct = product;

    this.loadProductBatches(product.id);
  }

  loadProductBatches(productId: number): void {

    this.isLoadingBatches = true;

    this.inventoryService
      .getProductBatches(productId)
      .subscribe({
        next: (batches) => {
          this.selectedProductBatches = batches;
          this.isLoadingBatches = false;
        },

        error: (error) => {
          console.error(
            'Failed to load product batches:',
            error
          );

          this.selectedProductBatches = [];
          this.isLoadingBatches = false;

          alert(
            'Unable to load product batches.'
          );
        }
      });
  }


  openProductForm(): void {
  this.showProductForm = true;

  this.productForm.reset({
    productName: '',
    barcode: '',
    unit: 'piece'
  });
}

closeProductForm(): void {
  this.showProductForm = false;
  this.productForm.reset({
    productName: '',
    barcode: '',
    unit: 'piece'
  });
}

saveProduct(): void {

  if (this.productForm.invalid) {
    this.productForm.markAllAsTouched();
    return;
  }

  this.isSavingProduct = true;

  const formValue = this.productForm.value;

  const request = {
    productName: formValue.productName.trim(),

    barcode: formValue.barcode
      ? formValue.barcode.trim()
      : null,

    unit: formValue.unit.trim()
  };

  this.inventoryService
    .createProduct(request)
    .subscribe({

      next: (product) => {

        this.products = [
          product,
          ...this.products
        ];

        this.isSavingProduct = false;
        this.showProductForm = false;

        this.productForm.reset({
          productName: '',
          barcode: '',
          unit: 'piece'
        });

        this.selectProduct(product);
      },

      error: (error) => {

        console.error(
          'Failed to create product:',
          error
        );

        this.isSavingProduct = false;

        const message =
          error?.error?.message ||
          'Unable to create product.';

        alert(message);
      }
    });
}

openBatchForm(): void {

  if (!this.selectedProduct) {
    return;
  }

  this.showBatchForm = true;

  this.batchForm.reset({
    batchNumber: '',
    purchasePrice: null,
    sellingPrice: null,
    quantity: null,
    expiryDate: null
  });
}

closeBatchForm(): void {

  this.showBatchForm = false;

  this.batchForm.reset({
    batchNumber: '',
    purchasePrice: null,
    sellingPrice: null,
    quantity: null,
    expiryDate: null
  });
}

saveBatch(): void {

  if (!this.selectedProduct) {
    return;
  }

  if (this.batchForm.invalid) {
    this.batchForm.markAllAsTouched();
    return;
  }

  this.isSavingBatch = true;

  const formValue = this.batchForm.value;

  const request = {
    batchNumber: formValue.batchNumber.trim(),

    purchasePrice: Number(
      formValue.purchasePrice
    ),

    sellingPrice: Number(
      formValue.sellingPrice
    ),

    quantity: Number(
      formValue.quantity
    ),

    expiryDate: formValue.expiryDate
      ? formValue.expiryDate
      : null
  };

  this.inventoryService
    .addBatch(
      this.selectedProduct.id,
      request
    )
    .subscribe({

      next: () => {

        this.isSavingBatch = false;

        this.showBatchForm = false;

        this.batchForm.reset({
          batchNumber: '',
          purchasePrice: null,
          sellingPrice: null,
          quantity: null,
          expiryDate: null
        });

        this.loadProductBatches(
          this.selectedProduct!.id
        );
      },

      error: (error) => {

        console.error(
          'Failed to add batch:',
          error
        );

        this.isSavingBatch = false;

        const message =
          error?.error?.message ||
          'Unable to add batch.';

        alert(message);
      }
    });
}
  openBarcodeScanner(): void {
  this.scannerMode = 'LOOKUP';
  this.showBarcodeScanner = true;
}

openBarcodeScannerForProduct(): void {
  this.scannerMode = 'PRODUCT_FORM';
  this.showBarcodeScanner = true;
}

closeBarcodeScanner(): void {
  this.showBarcodeScanner = false;
}

  onBarcodeScanned(barcode: string): void {

  console.log(
    'Scanned barcode:',
    barcode
  );

  this.showBarcodeScanner = false;

  if (this.scannerMode === 'PRODUCT_FORM') {

    this.productForm.patchValue({
      barcode: barcode
    });

    return;
  }

  this.inventoryService
    .findProductByBarcode(barcode)
    .subscribe({

      next: (product) => {

        this.selectProduct(product);

      },

      error: (error) => {

        console.error(
          'Product lookup failed:',
          error
        );

        alert(
          `No product found for barcode: ${barcode}`
        );
      }
    });
}

}