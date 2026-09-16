import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  code: number;
  message: string;
  data?: any;
}

export interface JwtPayload {
  sub: string;
  role: 'USER' | 'ADMIN';
  name: string;
  email: string;
  mobile: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL =
    'http://localhost:2003/api/auth';

  constructor(
    private http: HttpClient
  ) {}

  register(data: {
    name: string;
    mobileNumber: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.API_URL}/register`,
      data
    );
  }

  login(data: {
    loginId: string;
    password: string;
  }): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.API_URL}/login`,
      data
    );
  }

  getUserFromToken(): JwtPayload | null {

    const accessToken =
      localStorage.getItem('accessToken');

    if (!accessToken) {
      return null;
    }

    try {

      const payload =
        accessToken.split('.')[1];

      const decodedPayload =
        JSON.parse(atob(payload));

      return decodedPayload as JwtPayload;

    } catch (error) {

      console.error(
        'Failed to decode access token:',
        error
      );

      return null;
    }
  }

  getUserRole(): 'USER' | 'ADMIN' | null {

    const user =
      this.getUserFromToken();

    return user?.role ?? null;
  }

  isLoggedIn(): boolean {

    const accessToken =
      localStorage.getItem('accessToken');

    return !!accessToken;
  }

  logout(): void {

    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'refreshToken'
    );
  }
}