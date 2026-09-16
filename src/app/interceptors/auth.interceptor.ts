import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  AuthService
} from '../services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const authService = inject(AuthService);


  // =====================================================
  // AUTH REQUESTS
  // =====================================================

  const isAuthRequest =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register');


  // Login and registration do not need JWT
  if (isAuthRequest) {
    return next(req);
  }


  // =====================================================
  // GET ACCESS TOKEN
  // =====================================================

  const accessToken =
    localStorage.getItem('accessToken');


  // =====================================================
  // ADD JWT IF AVAILABLE
  // =====================================================

  let request = req;

  if (accessToken) {

    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });

  }


  // =====================================================
  // SEND REQUEST + HANDLE ERRORS
  // =====================================================

  return next(request).pipe(

    catchError((error: HttpErrorResponse) => {

      // JWT expired / invalid
      if (error.status === 401) {

        console.log(
          'Session expired. Logging out...'
        );


        authService.logout();


        router.navigate(['/login']);

      }


      return throwError(() => error);

    })

  );

};