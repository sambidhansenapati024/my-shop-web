import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KhataRecord {
  date: string;
  description: string;
  billNumber: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
}

@Component({
  selector: 'app-khata',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './khata.component.html',
  styleUrl: './khata.component.css'
})
export class KhataComponent {

  customerName = 'Customer Name';
  customerId = 'CUS-001';

  currentPage = 0;

  totalPages = 4;

  khataRecords: KhataRecord[] = [
    {
      date: '18 Sep 2026',
      description: 'Grocery Purchase',
      billNumber: 'BILL-001',
      amount: 850,
      paidAmount: 500,
      remainingAmount: 350
    },
    {
      date: '15 Sep 2026',
      description: 'Monthly Grocery',
      billNumber: 'BILL-002',
      amount: 1200,
      paidAmount: 1200,
      remainingAmount: 0
    },
    {
      date: '10 Sep 2026',
      description: 'Rice and Vegetables',
      billNumber: 'BILL-003',
      amount: 650,
      paidAmount: 400,
      remainingAmount: 250
    }
  ];

  get totalAmount(): number {
    return this.khataRecords.reduce(
      (total, record) => total + record.amount,
      0
    );
  }

  get totalPaid(): number {
    return this.khataRecords.reduce(
      (total, record) => total + record.paidAmount,
      0
    );
  }

  get totalDue(): number {
    return this.khataRecords.reduce(
      (total, record) => total + record.remainingAmount,
      0
    );
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }

  isCoverPage(): boolean {
    return this.currentPage === 0;
  }

  isSummaryPage(): boolean {
    return this.currentPage === 1;
  }

  isRecordsPage(): boolean {
    return this.currentPage >= 2;
  }
}