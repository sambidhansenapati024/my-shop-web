import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name = '';
  mobileNumber = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Returns a score from 0-4 used to drive the strength meter
  get passwordStrength(): number {

    const value = this.password;

    if (!value) {
      return 0;
    }

    let score = 0;

    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    return score;
  }

  get passwordStrengthLabel(): string {

    switch (this.passwordStrength) {
      case 0: return '';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  }

  get passwordsMatch(): boolean {
    return !!this.confirmPassword && this.password === this.confirmPassword;
  }

  get passwordsMismatch(): boolean {
    return !!this.confirmPassword && this.password !== this.confirmPassword;
  }

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (
      !this.name.trim() ||
      !this.mobileNumber.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    // Password confirmation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    const registerData = {
      name: this.name.trim(),
      mobileNumber: this.mobileNumber.trim(),
      email: this.email.trim(),
      password: this.password
    };

    this.authService.register(registerData).subscribe({

      next: (response) => {

        this.isLoading = false;

        this.successMessage =
          response?.message || 'Account created successfully.';

        // Go to login after registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },

      error: (error) => {

        this.isLoading = false;

        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage =
            'Registration failed. Please try again.';
        }
      }

    });
  }
}