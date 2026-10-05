import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  Output
} from '@angular/core';

import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats
} from 'html5-qrcode';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.css'
})
export class BarcodeScannerComponent
  implements OnDestroy {

  @Output()
  scanned = new EventEmitter<string>();

  @Output()
  closed = new EventEmitter<void>();

  private scanner: Html5Qrcode | null = null;

  isStarting = true;
  hasError = false;
  errorMessage = '';

  private readonly scannerId =
    'barcode-scanner-reader';

  ngAfterViewInit(): void {
    this.startScanner();
  }

  async startScanner(): Promise<void> {

    this.isStarting = true;
    this.hasError = false;
    this.errorMessage = '';

    try {

      this.scanner =
        new Html5Qrcode(this.scannerId);

      const config = {
        fps: 10,

        qrbox: {
          width: 280,
          height: 160
        },

        aspectRatio: 1.777778,

        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      };

      await this.scanner.start(

        {
          facingMode: 'environment'
        },

        config,

        (decodedText) => {

          console.log(
            'Barcode scanned:',
            decodedText
          );

          this.scanned.emit(decodedText);

          this.stopScanner();

        },

        () => {
          // Ignore continuous scan failures.
          // They are normal while the camera
          // is searching for a barcode.
        }
      );

      this.isStarting = false;

    } catch (error) {

      console.error(
        'Failed to start barcode scanner:',
        error
      );

      this.isStarting = false;
      this.hasError = true;

      this.errorMessage =
        'Unable to access the camera. Please allow camera permission and try again.';
    }
  }

  async stopScanner(): Promise<void> {

    if (!this.scanner) {
      return;
    }

    try {

      await this.scanner.stop();

      this.scanner.clear();

    } catch (error) {

      console.error(
        'Failed to stop barcode scanner:',
        error
      );
    } finally {

      this.scanner = null;
    }
  }

  async close(): Promise<void> {

    await this.stopScanner();

    this.closed.emit();
  }

  async ngOnDestroy(): Promise<void> {

    await this.stopScanner();
  }
}