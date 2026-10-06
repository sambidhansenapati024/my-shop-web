import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
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
  implements AfterViewInit, OnDestroy {

  @Output()
  scanned = new EventEmitter<string>();

  @Output()
  closed = new EventEmitter<void>();

  private scanner: Html5Qrcode | null = null;

  isStarting = true;
  hasError = false;
  errorMessage = '';

  /** true for a moment after a barcode is read (shows the green tick) */
  isSuccess = false;

  /** flashlight (only on phones whose camera supports it) */
  torchSupported = false;
  torchOn = false;

  private audioContext: AudioContext | null = null;
  private hasScanned = false;
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly scannerId =
    'barcode-scanner-reader';

  ngAfterViewInit(): void {
    this.startScanner();
  }

  /* =========================================================
     KEYBOARD
  ========================================================= */

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  /* =========================================================
     START
  ========================================================= */

  async startScanner(): Promise<void> {

    this.isStarting = true;
    this.hasError = false;
    this.errorMessage = '';
    this.hasScanned = false;
    this.isSuccess = false;
    this.torchSupported = false;
    this.torchOn = false;

    try {

      this.scanner =
        new Html5Qrcode(this.scannerId);

      const config = {
        fps: 10,

        // keep these numbers in sync with .viewfinder in the CSS
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
          this.onDecoded(decodedText);
        },

        () => {
          // Ignore continuous scan failures.
          // They are normal while the camera
          // is searching for a barcode.
        }
      );

      this.isStarting = false;
      this.detectTorch();

    } catch (error) {

      console.error(
        'Failed to start barcode scanner:',
        error
      );

      this.isStarting = false;
      this.hasError = true;

      this.errorMessage =
        'Unable to access the camera. Allow camera permission and try again, or type the barcode below.';
    }
  }

  /* =========================================================
     RESULT
  ========================================================= */

  private onDecoded(decodedText: string): void {

    // Prevent multiple beeps for the same barcode
    if (this.hasScanned) {
      return;
    }

    this.hasScanned = true;

    console.log(
      'Barcode scanned:',
      decodedText
    );

    this.playBeep();

    // Freeze the picture and show the green tick for a moment,
    // then hand the barcode to the page.
    this.isSuccess = true;

    try {
      this.scanner?.pause(true);
    } catch {
      // not important
    }

    this.successTimer = setTimeout(() => {
      this.scanned.emit(decodedText);
      this.stopScanner();
    }, 450);
  }

  /** Used when the barcode is typed instead of scanned. */
  submitManual(value: string): void {

    const code = (value || '').trim();

    if (!code || this.hasScanned) {
      return;
    }

    this.hasScanned = true;

    this.playBeep();

    this.scanned.emit(code);

    this.stopScanner();
  }

  /* =========================================================
     FLASHLIGHT
  ========================================================= */

  private detectTorch(): void {
    try {
      const capabilities: any =
        this.scanner?.getRunningTrackCapabilities();

      this.torchSupported = !!capabilities?.torch;

    } catch {
      this.torchSupported = false;
    }
  }

  async toggleTorch(): Promise<void> {

    if (!this.scanner) {
      return;
    }

    const next = !this.torchOn;

    try {
      await this.scanner.applyVideoConstraints({
        advanced: [{ torch: next } as any]
      });

      this.torchOn = next;

    } catch (error) {
      console.warn('Flashlight is not available:', error);
      this.torchSupported = false;
    }
  }

  /* =========================================================
     STOP / CLOSE
  ========================================================= */

  async stopScanner(): Promise<void> {

    if (!this.scanner) {
      return;
    }

    const scanner = this.scanner;
    this.scanner = null;

    try {

      await scanner.stop();

      scanner.clear();

    } catch (error) {

      console.error(
        'Failed to stop barcode scanner:',
        error
      );
    }
  }

  async close(): Promise<void> {

    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }

    await this.stopScanner();

    this.closed.emit();
  }

  async ngOnDestroy(): Promise<void> {

    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    await this.stopScanner();
  }

  /* =========================================================
     BEEP
  ========================================================= */

  private playBeep(): void {

    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator =
        this.audioContext.createOscillator();

      const gainNode =
        this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(
        1000,
        this.audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(
        0.15,
        this.audioContext.currentTime
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();

      oscillator.stop(
        this.audioContext.currentTime + 0.12
      );

    } catch (error) {
      console.warn(
        'Unable to play barcode scanner beep:',
        error
      );
    }
  }
}