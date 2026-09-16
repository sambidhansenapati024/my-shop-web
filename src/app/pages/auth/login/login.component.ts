import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginId = '';
  password = '';
  showPassword = false;
  rememberMe = false;

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {

    this.errorMessage = '';

    if (!this.loginId.trim() || !this.password) {
      this.errorMessage =
        'Please enter your mobile number/email and password.';
      return;
    }

    this.isLoading = true;

    const loginData = {
      loginId: this.loginId.trim(),
      password: this.password
    };

    this.authService.login(loginData).subscribe({

      next: (response) => {

        this.isLoading = false;

        const accessToken = response?.data?.accessToken;
        const refreshToken = response?.data?.refreshToken;

        if (!accessToken) {
          this.errorMessage =
            'Login failed. Access token was not received.';
          return;
        }

        // Store JWT tokens
        localStorage.setItem(
          'accessToken',
          accessToken
        );

        if (refreshToken) {
          localStorage.setItem(
            'refreshToken',
            refreshToken
          );
        }

        // Temporary redirect.
        // We will replace this with role-based
        // redirect after checking the JWT.
        const role = this.authService.getUserRole();

        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'USER') {
          this.router.navigate(['/app/home']);
        } else {
          this.errorMessage = 'Unable to determine user role.';
        }
      },

      error: (error) => {

        this.isLoading = false;

        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage =
            'Login failed. Please check your credentials.';
        }
      }

    });
  }
}