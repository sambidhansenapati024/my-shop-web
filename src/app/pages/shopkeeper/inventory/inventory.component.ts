import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InventoryService, Product, ProductBatch } from '../../../services/inventory.service';
import { BarcodeScannerComponent } from '../../../shared/barcode-scanner/barcode-scanner.component';

type ExpiryStatus = 'none' | 'ok' | 'soon' | 'expired';
type StockStatus = 'in' | 'low' | 'out';
type StatusFilter = 'all' | 'in' | 'low' | 'out' | 'expiring';
type SortKey = 'name' | 'stockAsc' | 'stockDesc';

/** Everything the table needs to know about one product. */
interface ProductInfo {
  stock: number;
  value: number;
  batchCount: number;
  stockStatus: StockStatus;
  expiryStatus: ExpiryStatus;
  nextExpiry: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}

const EMPTY_INFO: ProductInfo = {
  stock: 0,
  value: 0,
  batchCount: 0,
  stockStatus: 'out',
  expiryStatus: 'none',
  nextExpiry: null,
  minPrice: null,
  maxPrice: null
};

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BarcodeScannerComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {

  /** A product with this much stock (or less) is shown as "Low stock". */
  readonly LOW_STOCK_LIMIT = 10;

  /** Batches expiring within this many days are shown as "Soon". */
  readonly EXPIRY_WARNING_DAYS = 30;

  readonly filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in', label: 'In stock' },
    { key: 'low', label: 'Low stock' },
    { key: 'out', label: 'Out of stock' },
    { key: 'expiring', label: 'Expiring' }
  ];

  // ---- data ----
  products: Product[] = [];
  batchesByProduct: Record<number, ProductBatch[]> = {};

  selectedProduct: Product | null = null;
  selectedProductBatches: ProductBatch[] = [];

  // ---- list state ----
  searchTerm = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey = 'name';

  visibleProducts: Product[] = [];
  productInfo: Record<number, ProductInfo> = {};

  stats = { total: 0, inStock: 0, low: 0, out: 0, expiring: 0, expired: 0, value: 0 };
  filterCounts: Record<StatusFilter, number> = { all: 0, in: 0, low: 0, out: 0, expiring: 0 };

  // ---- loading flags ----
  isLoading = false;
  isLoadingStock = false;
  isLoadingBatches = false;

  // ---- forms ----
  showProductForm = false;
  showBatchForm = false;

  productForm: FormGroup;
  batchForm: FormGroup;

  isSavingProduct = false;
  isSavingBatch = false;

  // ---- barcode ----
  showBarcodeScanner = false;
  scannerMode: 'LOOKUP' | 'PRODUCT_FORM' = 'LOOKUP';

  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.maxLength(200)]],
      barcode: ['', Validators.maxLength(100)],
      unit: ['piece', [Validators.required, Validators.maxLength(30)]]
    });

    this.batchForm = this.fb.group({
      batchNumber: ['', [Validators.required, Validators.maxLength(100)]],
      purchasePrice: [null, [Validators.required, Validators.min(0)]],
      sellingPrice: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0.001)]],
      expiryDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  /* =========================================================
     KEYBOARD
  ========================================================= */

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showBarcodeScanner) {
      return; // the scanner handles its own closing
    }

    if (this.showBatchForm) {
      this.closeBatchForm();
    } else if (this.showProductForm) {
      this.closeProductForm();
    } else if (this.selectedProduct) {
      this.closeDrawer();
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  loadProducts(): void {
    this.isLoading = true;

    this.inventoryService
      .getAllProducts()
      .subscribe({
        next: (products) => {
          this.products = products;
          this.isLoading = false;

          this.refreshStats();
          this.loadAllBatches();
        },

        error: (error) => {
          console.error('Failed to load inventory products:', error);
          this.isLoading = false;
          alert('Unable to load inventory products.');
        }
      });
  }

  /**
   * Loads the batches of every product so the table can show stock levels.
   * (One request per product. If you ever have hundreds of products, ask
   * your backend for a single "stock summary" endpoint instead.)
   */
  private loadAllBatches(): void {
    if (this.products.length === 0) {
      this.batchesByProduct = {};
      this.refreshStats();
      return;
    }

    this.isLoadingStock = true;

    const requests = this.products.map(product =>
      this.inventoryService
        .getProductBatches(product.id)
        .pipe(catchError(() => of([] as ProductBatch[])))
    );

    forkJoin(requests).subscribe(results => {
      const map: Record<number, ProductBatch[]> = {};

      this.products.forEach((product, index) => {
        map[product.id] = results[index];
      });

      this.batchesByProduct = map;
      this.isLoadingStock = false;

      if (this.selectedProduct) {
        this.selectedProductBatches = map[this.selectedProduct.id] ?? [];
      }

      this.refreshStats();
    });
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.showBatchForm = false;

    const cached = this.batchesByProduct[product.id];

    if (cached) {
      this.selectedProductBatches = cached;
      this.loadProductBatches(product.id, true);
    } else {
      this.selectedProductBatches = [];
      this.loadProductBatches(product.id);
    }
  }

  loadProductBatches(productId: number, silent = false): void {
    if (!silent) {
      this.isLoadingBatches = true;
    }

    this.inventoryService
      .getProductBatches(productId)
      .subscribe({
        next: (batches) => {
          this.batchesByProduct = { ...this.batchesByProduct, [productId]: batches };

          if (this.selectedProduct?.id === productId) {
            this.selectedProductBatches = batches;
          }

          this.isLoadingBatches = false;
          this.refreshStats();
        },

        error: (error) => {
          console.error('Failed to load product batches:', error);

          if (!silent) {
            this.selectedProductBatches = [];
            alert('Unable to load product batches.');
          }

          this.isLoadingBatches = false;
        }
      });
  }

  closeDrawer(): void {
    this.selectedProduct = null;
    this.selectedProductBatches = [];
    this.showBatchForm = false;
  }

  /** "+" button in a table row: opens the product and its Add batch form. */
  quickAddBatch(product: Product, event: Event): void {
    event.stopPropagation();

    this.selectProduct(product);
    this.openBatchForm();
  }

  /* =========================================================
     STATS, FILTERS, SORTING
  ========================================================= */

  info(product: Product): ProductInfo {
    return this.productInfo[product.id] ?? EMPTY_INFO;
  }

  stockLabel(status: StockStatus): string {
    switch (status) {
      case 'in': return 'In stock';
      case 'low': return 'Low stock';
      default: return 'Out of stock';
    }
  }

  filterCount(key: StatusFilter): number {
    return this.filterCounts[key];
  }

  /** Re-calculates everything the dashboard shows. */
  private refreshStats(): void {
    const infoMap: Record<number, ProductInfo> = {};

    const stats = { total: this.products.length, inStock: 0, low: 0, out: 0, expiring: 0, expired: 0, value: 0 };
    const counts: Record<StatusFilter, number> = { all: this.products.length, in: 0, low: 0, out: 0, expiring: 0 };

    for (const product of this.products) {

      const batches = (this.batchesByProduct[product.id] ?? [])
        .filter(batch => Number(batch.quantity) > 0);

      let stock = 0;
      let value = 0;
      let minPrice: number | null = null;
      let maxPrice: number | null = null;

      let expiryStatus: ExpiryStatus = 'none';
      let nextExpiry: string | null = null;
      let nextExpiryDays = Infinity;

      for (const batch of batches) {
        const quantity = Number(batch.quantity);
        const selling = Number(batch.sellingPrice);

        stock += quantity;
        value += quantity * Number(batch.purchasePrice || 0);

        if (!isNaN(selling)) {
          minPrice = minPrice === null ? selling : Math.min(minPrice, selling);
          maxPrice = maxPrice === null ? selling : Math.max(maxPrice, selling);
        }

        const status = this.getExpiryStatus(batch);
        const days = this.getDaysToExpiry(batch);

        if (status === 'expired') {
          expiryStatus = 'expired';
        } else if (status === 'soon' && expiryStatus !== 'expired') {
          expiryStatus = 'soon';
        } else if (status === 'ok' && expiryStatus === 'none') {
          expiryStatus = 'ok';
        }

        if (days !== null && days < nextExpiryDays) {
          nextExpiryDays = days;
          nextExpiry = String(batch.expiryDate);
        }
      }

      const stockStatus: StockStatus =
        stock <= 0 ? 'out' : stock <= this.LOW_STOCK_LIMIT ? 'low' : 'in';

      infoMap[product.id] = {
        stock,
        value,
        batchCount: (this.batchesByProduct[product.id] ?? []).length,
        stockStatus,
        expiryStatus,
        nextExpiry,
        minPrice,
        maxPrice
      };

      stats.value += value;

      if (stockStatus === 'in') { stats.inStock++; counts.in++; }
      if (stockStatus === 'low') { stats.low++; counts.low++; }
      if (stockStatus === 'out') { stats.out++; counts.out++; }

      if (expiryStatus === 'expired') { stats.expired++; }

      if (expiryStatus === 'expired' || expiryStatus === 'soon') {
        stats.expiring++;
        counts.expiring++;
      }
    }

    this.productInfo = infoMap;
    this.stats = stats;
    this.filterCounts = counts;

    this.applyFilters();
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    let list = this.products.filter(product => {

      if (term) {
        const matchesText =
          product.productName.toLowerCase().includes(term) ||
          (product.barcode ?? '').toLowerCase().includes(term);

        if (!matchesText) {
          return false;
        }
      }

      const info = this.info(product);

      switch (this.statusFilter) {
        case 'in': return info.stockStatus === 'in';
        case 'low': return info.stockStatus === 'low';
        case 'out': return info.stockStatus === 'out';
        case 'expiring': return info.expiryStatus === 'soon' || info.expiryStatus === 'expired';
        default: return true;
      }
    });

    list = [...list].sort((a, b) => {
      switch (this.sortKey) {
        case 'stockAsc': return this.info(a).stock - this.info(b).stock;
        case 'stockDesc': return this.info(b).stock - this.info(a).stock;
        default: return a.productName.localeCompare(b.productName);
      }
    });

    this.visibleProducts = list;
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  setFilter(key: StatusFilter): void {
    this.statusFilter = key;
    this.applyFilters();
  }

  setSort(key: string): void {
    this.sortKey = key as SortKey;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  trackById(_index: number, product: Product): number {
    return product.id;
  }

  /* =========================================================
     EXPORT
  ========================================================= */

  exportCsv(): void {
    const rows: (string | number)[][] = [
      ['Product', 'Barcode', 'Unit', 'Stock', 'Batches', 'Stock value', 'Status', 'Next expiry']
    ];

    for (const product of this.products) {
      const info = this.info(product);

      rows.push([
        product.productName,
        product.barcode ?? '',
        product.unit,
        info.stock,
        info.batchCount,
        info.value.toFixed(2),
        this.stockLabel(info.stockStatus),
        info.nextExpiry ?? ''
      ]);
    }

    const csv = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /* =========================================================
     PRODUCT AVATAR
  ========================================================= */

  productInitial(name: string): string {
    const match = (name || '').trim().match(/[A-Za-z0-9]/);
    return match ? match[0].toUpperCase() : '#';
  }

  /** Gives every product its own soft colour, always the same for the same name. */
  avatarHue(name: string): number {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) % 360;
    }

    return hash;
  }

  /* =========================================================
     DRAWER SUMMARY (selected product)
  ========================================================= */

  get totalStock(): number {
    return this.selectedProductBatches.reduce(
      (sum, batch) => sum + Number(batch.quantity || 0), 0
    );
  }

  get stockValue(): number {
    return this.selectedProductBatches.reduce(
      (sum, batch) => sum + Number(batch.quantity || 0) * Number(batch.purchasePrice || 0), 0
    );
  }

  get expiryWatch(): { text: string; tone: 'ok' | 'warn' | 'bad' | 'muted' } {
    const batches = this.selectedProductBatches.filter(b => Number(b.quantity) > 0);

    const expired = batches.filter(b => this.getExpiryStatus(b) === 'expired').length;
    const soon = batches.filter(b => this.getExpiryStatus(b) === 'soon').length;

    if (expired > 0) {
      return { text: `${expired} expired`, tone: 'bad' };
    }

    if (soon > 0) {
      return { text: `${soon} expiring soon`, tone: 'warn' };
    }

    if (batches.some(b => !!b.expiryDate)) {
      return { text: 'All good', tone: 'ok' };
    }

    return { text: 'No expiry dates', tone: 'muted' };
  }

  /** How much of the product's total stock this batch holds (0-100). */
  getShare(batch: ProductBatch): number {
    const total = this.totalStock;
    return total > 0 ? (Number(batch.quantity || 0) / total) * 100 : 0;
  }

  /** Profit on cost, in percent. Null when it can't be worked out. */
  getMargin(batch: ProductBatch): number | null {
    const purchase = Number(batch.purchasePrice);
    const selling = Number(batch.sellingPrice);

    if (!purchase || purchase <= 0 || isNaN(selling)) {
      return null;
    }

    return ((selling - purchase) / purchase) * 100;
  }

  /** Live margin shown in the "Add batch" form. */
  get batchFormMargin(): number | null {
    const purchase = Number(this.batchForm.value.purchasePrice);
    const selling = Number(this.batchForm.value.sellingPrice);

    if (!purchase || purchase <= 0 || !selling) {
      return null;
    }

    return ((selling - purchase) / purchase) * 100;
  }

  /* =========================================================
     EXPIRY HELPERS
  ========================================================= */

  private parseDate(value: string): Date {
    return new Date(value.length === 10 ? `${value}T00:00:00` : value);
  }

  getDaysToExpiry(batch: ProductBatch): number | null {
    if (!batch.expiryDate) {
      return null;
    }

    const expiry = this.parseDate(String(batch.expiryDate));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Math.round((expiry.getTime() - today.getTime()) / 86400000);

    return isNaN(days) ? null : days;
  }

  getExpiryStatus(batch: ProductBatch): ExpiryStatus {
    const days = this.getDaysToExpiry(batch);

    if (days === null) {
      return 'none';
    }

    if (days < 0) {
      return 'expired';
    }

    if (days <= this.EXPIRY_WARNING_DAYS) {
      return 'soon';
    }

    return 'ok';
  }

  getExpiryLabel(batch: ProductBatch): string {
    const days = this.getDaysToExpiry(batch);

    if (days === null) {
      return '';
    }

    if (days < 0) {
      return 'Expired';
    }

    if (days === 0) {
      return 'Expires today';
    }

    return days === 1 ? '1 day left' : `${days} days left`;
  }

  /* =========================================================
     PRODUCT FORM
  ========================================================= */

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
      barcode: formValue.barcode ? formValue.barcode.trim() : null,
      unit: formValue.unit.trim()
    };

    this.inventoryService
      .createProduct(request)
      .subscribe({
        next: (product) => {
          this.products = [product, ...this.products];
          this.batchesByProduct = { ...this.batchesByProduct, [product.id]: [] };

          this.isSavingProduct = false;
          this.showProductForm = false;

          this.searchTerm = '';
          this.statusFilter = 'all';

          this.productForm.reset({
            productName: '',
            barcode: '',
            unit: 'piece'
          });

          this.refreshStats();
          this.selectProduct(product);
        },

        error: (error) => {
          console.error('Failed to create product:', error);

          this.isSavingProduct = false;

          alert(error?.error?.message || 'Unable to create product.');
        }
      });
  }

  /* =========================================================
     BATCH FORM
  ========================================================= */

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
      purchasePrice: Number(formValue.purchasePrice),
      sellingPrice: Number(formValue.sellingPrice),
      quantity: Number(formValue.quantity),
      expiryDate: formValue.expiryDate ? formValue.expiryDate : null
    };

    this.inventoryService
      .addBatch(this.selectedProduct.id, request)
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

          // refreshes the drawer AND the table / dashboard numbers
          this.loadProductBatches(this.selectedProduct!.id, true);
        },

        error: (error) => {
          console.error('Failed to add batch:', error);

          this.isSavingBatch = false;

          alert(error?.error?.message || 'Unable to add batch.');
        }
      });
  }

  /* =========================================================
     BARCODE
  ========================================================= */

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
    console.log('Scanned barcode:', barcode);

    this.showBarcodeScanner = false;

    if (this.scannerMode === 'PRODUCT_FORM') {
      this.productForm.patchValue({ barcode: barcode });
      return;
    }

    this.inventoryService
      .findProductByBarcode(barcode)
      .subscribe({
        next: (product) => {
          this.selectProduct(product);
        },

        error: (error) => {
          console.error('Product lookup failed:', error);

          alert(`No product found for barcode: ${barcode}`);
        }
      });
  }

}