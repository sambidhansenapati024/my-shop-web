import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';



import { BarcodeScannerComponent } from '../../../shared/barcode-scanner/barcode-scanner.component';
import { BillingProduct, BillingProductBatch, ManualBill, ManualBillingService } from '../../../services/manual-billing.service';

@Component({
  selector: 'app-manual-billing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BarcodeScannerComponent,
    FormsModule
  ],
  templateUrl: './manual-billing.component.html',
  styleUrl: './manual-billing.component.css'
})
export class ManualBillingComponent implements OnInit {

  // -----------------------------
  // Bill
  // -----------------------------

  currentBill: ManualBill | null = null;

openBills: ManualBill[] = [];

activeBillId: number | null = null;

  isCreatingBill = false;
  isLoadingBill = false;

  // -----------------------------
  // Customer
  // -----------------------------

  customerForm: FormGroup;

  // -----------------------------
  // Products
  // -----------------------------

  products: BillingProduct[] = [];

  selectedProduct: BillingProduct | null = null;

  batches: BillingProductBatch[] = [];

  selectedBatch: BillingProductBatch | null = null;

  quantity = 1;

  isLoadingProducts = false;
  isLoadingBatches = false;

  isAddingItem = false;
  isGeneratingBill = false;

  // -----------------------------
  // Barcode scanner
  // -----------------------------

  showBarcodeScanner = false;

  paidAmount = 0;
  paymentMethod = 'CASH';

isProcessingPayment = false;
private readonly OPEN_BILLS_STORAGE_KEY = 'myshop_open_bill_ids';

  // -----------------------------
  // Constructor
  // -----------------------------

  constructor(
    private fb: FormBuilder,
    private manualBillingService: ManualBillingService
  ) {

    this.customerForm = this.fb.group({
      customerName: [
        '',
        [Validators.maxLength(150)]
      ],

      customerMobile: [
        '',
        [Validators.maxLength(20)]
      ]
    });
  }

  // -----------------------------
  // Init
  // -----------------------------

  ngOnInit(): void {
    this.loadProducts();
    this.restoreOpenBills();
  }

  // -----------------------------
  // Load Products
  // -----------------------------

  loadProducts(): void {

  this.isLoadingProducts = true;

  this.manualBillingService
    .getAllProducts()
    .subscribe({
      next: (products) => {

        this.products = products;

        this.isLoadingProducts = false;
      },

      error: (error) => {

        console.error(
          'Failed to load products:',
          error
        );

        this.products = [];

        this.isLoadingProducts = false;

        alert(
          'Unable to load inventory products.'
        );
      }
    });
}

  // -----------------------------
  // Create Bill
  // -----------------------------

  createBill(): void {

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isCreatingBill = true;

    const request = {
      customerName:
        this.customerForm.value.customerName?.trim() || null,

      customerMobile:
        this.customerForm.value.customerMobile?.trim() || null
    };

    this.manualBillingService
      .createBill(request)
      .subscribe({
        next: (bill) => {

          this.openBills.push(bill);
          this.saveOpenBillIds();

          this.currentBill = bill;

          this.activeBillId = bill.id;

          this.paidAmount = 0;

          this.isCreatingBill = false;

          this.selectedProduct = null;
          this.selectedBatch = null;
          this.batches = [];
          this.quantity = 1;
        },

        error: (error) => {

          console.error(
            'Failed to create bill:',
            error
          );

          this.isCreatingBill = false;

          alert(
            'Unable to create bill. Please try again.'
          );
        }
      });
  }

  // -----------------------------
  // Product Selection
  // -----------------------------

  selectProduct(
    product: BillingProduct
  ): void {

    this.selectedProduct = product;

    this.selectedBatch = null;

    this.batches = [];

    this.quantity = 1;

    this.loadBatches(product.id);
  }

  // -----------------------------
  // Load Batches
  // -----------------------------

  loadBatches(productId: number): void {

    this.isLoadingBatches = true;

    this.manualBillingService
      .getAvailableBatches(productId)
      .subscribe({
        next: (batches) => {

          this.batches = batches;

          this.isLoadingBatches = false;

          if (batches.length === 1) {
            this.selectedBatch = batches[0];
          }
        },

        error: (error) => {

          console.error(
            'Failed to load batches:',
            error
          );

          this.batches = [];

          this.isLoadingBatches = false;

          alert(
            'Unable to load available batches.'
          );
        }
      });
  }

  // -----------------------------
  // Batch Selection
  // -----------------------------

  selectBatch(
    batch: BillingProductBatch
  ): void {

    this.selectedBatch = batch;

    this.quantity = 1;
  }

  // -----------------------------
  // Quantity
  // -----------------------------

  increaseQuantity(): void {

    if (!this.selectedBatch) {
      return;
    }

    if (this.quantity < this.selectedBatch.quantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {

    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // -----------------------------
  // Add Item
  // -----------------------------

  addItem(): void {

    if (!this.currentBill) {
      alert('Please create a bill first.');
      return;
    }

    if (this.currentBill.paymentStatus === 'PAID') {
      alert('This bill is already paid and cannot be modified.');
      return;
    }

    if (!this.selectedProduct) {
      alert('Please select a product.');
      return;
    }

    if (!this.selectedBatch) {
      alert('Please select a batch.');
      return;
    }

    if (
      this.quantity <= 0 ||
      this.quantity > this.selectedBatch.quantity
    ) {
      alert(
        `Quantity must be between 1 and ${this.selectedBatch.quantity}.`
      );

      return;
    }

    this.isAddingItem = true;

    const request = {
      productId: this.selectedProduct.id,

      productBatchId: this.selectedBatch.id,

      quantity: this.quantity
    };

    this.manualBillingService
      .addItem(
        this.currentBill.id,
        request
      )
      .subscribe({
        next: (bill) => {

          this.currentBill = bill;
          this.openBills = this.openBills.map(
            openBill => openBill.id === bill.id ? bill : openBill
          );
           this.saveOpenBillIds();
          this.paidAmount = 0;
          this.isAddingItem = false;

          this.selectedProduct = null;
          this.selectedBatch = null;
          this.batches = [];
          this.quantity = 1;
        },

        error: (error) => {

          console.error(
            'Failed to add item:',
            error
          );

          this.isAddingItem = false;

          alert(
            error?.error?.message ||
            'Unable to add item to bill.'
          );
        }
      });
  }

  // -----------------------------
  // Remove Item
  // -----------------------------

  removeItem(itemId: number): void {

    if (!this.currentBill) {
      return;
    }

    if (this.currentBill.paymentStatus === 'PAID') {
  alert('This bill is already paid and cannot be modified.');
  return;
}

    this.manualBillingService
      .removeItem(
        this.currentBill.id,
        itemId
      )
      .subscribe({
        next: (bill) => {

          this.currentBill = bill;
          this.openBills = this.openBills.map(
    openBill => openBill.id === bill.id ? bill : openBill
       );
   this.saveOpenBillIds();
        },

        error: (error) => {

          console.error(
            'Failed to remove item:',
            error
          );

          alert(
            error?.error?.message ||
            'Unable to remove item.'
          );
        }
      });
  }

  // -----------------------------
  // Barcode Scanner
  // -----------------------------

  openBarcodeScanner(): void {

    if (!this.currentBill) {
      alert('Please create a bill first.');
      return;
    }

    this.showBarcodeScanner = true;
  }

  closeBarcodeScanner(): void {

    this.showBarcodeScanner = false;
  }

  onBarcodeScanned(
    barcode: string
  ): void {

    this.showBarcodeScanner = false;

    if (!barcode) {
      return;
    }

    console.log(
      'Scanned product barcode:',
      barcode
    );

    this.manualBillingService
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
            'Product not found in inventory.'
          );
        }
      });
  }

  // -----------------------------
  // New Bill
  // -----------------------------

  startNewBill(): void {

  this.currentBill = null;

  this.activeBillId = null;

  this.selectedProduct = null;

  this.selectedBatch = null;

  this.batches = [];

  this.quantity = 1;

  this.paidAmount = 0;

  this.isProcessingPayment = false;

  this.customerForm.reset({
    customerName: '',
    customerMobile: ''
  });
}

switchBill(bill: ManualBill): void {

  this.currentBill = bill;

  this.activeBillId = bill.id;

  this.paidAmount = 0;

  this.selectedProduct = null;

  this.selectedBatch = null;

  this.batches = [];

  this.quantity = 1;
}

  // -----------------------------
  // Helpers
  // -----------------------------

  private saveOpenBillIds(): void {
  const billIds = this.openBills.map(bill => bill.id);

  localStorage.setItem(
    this.OPEN_BILLS_STORAGE_KEY,
    JSON.stringify(billIds)
  );
}

private clearOpenBillStorage(): void {
  localStorage.removeItem(this.OPEN_BILLS_STORAGE_KEY);
}

private restoreOpenBills(): void {

  const storedIds = localStorage.getItem(
    this.OPEN_BILLS_STORAGE_KEY
  );

  if (!storedIds) {
    return;
  }

  let billIds: number[];

  try {
    billIds = JSON.parse(storedIds);
  } catch (error) {
    console.error('Invalid open bill storage:', error);
    this.clearOpenBillStorage();
    return;
  }

  if (!Array.isArray(billIds) || billIds.length === 0) {
    return;
  }

  const validOpenBillIds: number[] = [];

  billIds.forEach((billId) => {

    this.manualBillingService
      .getBill(billId)
      .subscribe({
        next: (bill) => {

          this.openBills.push(bill);
          validOpenBillIds.push(bill.id);

          if (!this.currentBill) {
            this.currentBill = bill;
            this.activeBillId = bill.id;
          }

          this.saveRestoredBillIds(validOpenBillIds);
        },

        error: (error) => {
          console.error(
            `Failed to restore bill ${billId}:`,
            error
          );
        }
      });

  });
}

closeBillTab(bill: ManualBill): void {

  const wasActive = this.activeBillId === bill.id;

  // Remove only from the manual billing tabs
  this.openBills = this.openBills.filter(
    openBill => openBill.id !== bill.id
  );

  // Update localStorage
  this.saveOpenBillIds();

  // If the closed bill was active,
  // switch to another available bill
  if (wasActive) {

    if (this.openBills.length > 0) {

      const nextBill =
        this.openBills[this.openBills.length - 1];

      this.currentBill = nextBill;
      this.activeBillId = nextBill.id;

    } else {

      this.currentBill = null;
      this.activeBillId = null;

      this.selectedProduct = null;
      this.selectedBatch = null;
      this.batches = [];
      this.quantity = 1;
      this.paidAmount = 0;
    }
  }
}

private saveRestoredBillIds(billIds: number[]): void {

  localStorage.setItem(
    this.OPEN_BILLS_STORAGE_KEY,
    JSON.stringify(billIds)
  );
}

  isActiveBill(bill: ManualBill): boolean {
  return this.activeBillId === bill.id;
}


  getItemCount(): number {

    if (!this.currentBill?.items) {
      return 0;
    }

    return this.currentBill.items.length;
  }

  getGrandTotal(): number {

    return this.currentBill?.totalAmount || 0;
  }

  getRemainingAmount(): number {

    return this.currentBill?.remainingAmount || 0;
  }

 processPayment(): void {

  if (!this.currentBill) {
    return;
  }

  if (this.currentBill.paymentStatus === 'PAID') {
  alert('This bill is already paid.');
  return;
}

  const remainingAmount =
    this.currentBill.remainingAmount || 0;

  if (this.paidAmount < 0) {
    alert('Payment amount cannot be negative.');
    return;
  }

  if (this.paidAmount > remainingAmount) {
    alert(
      `Payment amount cannot be greater than ₹${remainingAmount.toFixed(2)}.`
    );
    return;
  }

  this.isProcessingPayment = true;

  this.manualBillingService
    .processPayment(
      this.currentBill.id,
      {
        paidAmount: this.paidAmount,
        paymentMethod: this.paymentMethod
      }
    )
    .subscribe({
      next: (bill) => {

  this.currentBill = bill;

  // Update the bill inside the open bill tabs
  this.openBills = this.openBills.map(
    openBill =>
      openBill.id === bill.id
        ? bill
        : openBill
  );

  // Keep the bill tab after payment
  this.saveOpenBillIds();

  // Clear payment input
  this.paidAmount = 0;

  this.isProcessingPayment = false;
},

      error: (error) => {

        console.error(
          'Payment failed:',
          error
        );

        this.isProcessingPayment = false;

        alert(
          error?.error?.message ||
          'Unable to process payment.'
        );
      }
    });
}

downloadBillPdf(): void {

  if (!this.currentBill) {
    return;
  }

  this.manualBillingService
    .downloadBillPdf(this.currentBill.id)
    .subscribe({
      next: (blob) => {

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download =
          `${this.currentBill?.billNumber || 'manual-bill'}.pdf`;

        link.click();

        window.URL.revokeObjectURL(url);
      },

      error: (error) => {

        console.error(
          'Failed to download bill PDF:',
          error
        );

        alert(
          'Unable to download bill PDF.'
        );
      }
    });
}

printBill(): void {

  if (!this.currentBill) {
    return;
  }

  this.manualBillingService
    .downloadBillPdf(this.currentBill.id)
    .subscribe({
      next: (blob) => {

        const url = window.URL.createObjectURL(blob);

        const printWindow = window.open(
          url,
          '_blank'
        );

        if (!printWindow) {

          alert(
            'Please allow pop-ups to print the bill.'
          );

          window.URL.revokeObjectURL(url);
          return;
        }

        printWindow.onload = () => {

          printWindow.focus();

          setTimeout(() => {
            printWindow.print();
          }, 300);
        };
      },

      error: (error) => {

        console.error(
          'Failed to print bill:',
          error
        );

        alert(
          'Unable to print bill.'
        );
      }
    });
}

  generateBill(): void {
  if (!this.currentBill) {
    return;
  }

  if (this.currentBill.items.length === 0) {
    alert('Please add at least one item before generating the bill.');
    return;
  }

  if (this.currentBill.billedAt) {
    return;
  }

  this.isGeneratingBill = true;

  this.manualBillingService.generateBill(this.currentBill.id).subscribe({
    next: (bill) => {
      this.currentBill = bill;

      this.openBills = this.openBills.map(
        openBill =>
          openBill.id === bill.id ? bill : openBill
      );

      this.saveOpenBillIds();

      this.isGeneratingBill = false;
    },

    error: (error) => {
      console.error('Failed to generate bill:', error);

      this.isGeneratingBill = false;

      alert(
        error?.error?.message ||
        'Unable to generate bill.'
      );
    }
  });
}

isCurrentBillPaid(): boolean {
  return this.currentBill?.paymentStatus === 'PAID';
}




}

