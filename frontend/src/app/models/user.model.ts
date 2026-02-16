export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}
