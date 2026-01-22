import { UserRoles } from "../../../prisma/generated/prisma/enums";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string | null;
  role: UserRoles;
  isPasswordSet?: boolean;
  lockedUntil?: Date | null;
  createdAt?: Date | null;
};

export type SignupData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRoles;
  };
};

export interface ApiResponse<T = any> extends Response {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
