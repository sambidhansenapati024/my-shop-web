import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService,
  JwtPayload
} from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent
  implements OnInit {

  user: JwtPayload | null = null;

  userInitial = 'U';

  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadUser();

  }

  loadUser(): void {

    this.user =
      this.authService.getUserFromToken();

    if (!this.user) {
      return;
    }

    this.isAdmin =
      this.user.role === 'ADMIN';

    this.userInitial =
      this.user.name
        ?.trim()
        .charAt(0)
        .toUpperCase() || 'U';
  }

  goToHome(): void {

    if (this.isAdmin) {

      this.router.navigate([
        '/admin/dashboard'
      ]);

    } else {

      this.router.navigate([
        '/app/home'
      ]);

    }
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }
}