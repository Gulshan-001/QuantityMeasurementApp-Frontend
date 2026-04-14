export interface User {
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  Token?: string;
  message?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}
