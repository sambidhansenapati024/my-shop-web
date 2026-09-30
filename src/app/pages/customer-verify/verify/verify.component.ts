import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';

interface BillVerificationResponse {
  valid: boolean;
  storeName: string | null;
  orderNumber: string | null;
  totalAmount: number | null;
  paymentStatus: string | null;
}

interface ApiResponse {
  code: number;
  data: BillVerificationResponse;
  message: string;
  status: string;
}

@Component({
  selector: 'app-verify',
  standalone: true,
   imports: [CommonModule,DecimalPipe],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  verificationCode = '';

  loading = true;

  error = false;

  bill: BillVerificationResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    this.verificationCode =
      this.route.snapshot.paramMap.get('verificationCode') || '';

    if (!this.verificationCode) {

      this.loading = false;
      this.error = true;

      return;
    }

    this.verifyBill();
  }


  verifyBill(): void {

    const apiUrl =
      `http://192.168.1.174:2003/api/verify/bill/${this.verificationCode}`;

    this.http
      .get<ApiResponse>(apiUrl)
      .subscribe({

        next: (response) => {

          this.loading = false;

          this.bill = response.data;

          this.error = !response.data.valid;

        },

        error: (err) => {

          console.error(
            'Bill verification failed:',
            err
          );

          this.loading = false;

          this.error = true;

        }

      });
  }

}