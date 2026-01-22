export interface CheckEnrollmentRequest {
  email: string;
}

/**
 * @deprecated Use CheckUserStatusResponse instead
 */
export interface CheckEnrollmentResponse {
  success: boolean;
  isEnrolled: boolean;
  hasAccount: boolean;
  studentName?: string;
  message: string;
}

export interface CheckUserStatusRequest {
  email: string;
}

export interface CheckUserStatusResponse {
  success: boolean;
  isRegistered: boolean;
  hasPassword: boolean;
  role?: string;
  userName?: string;
  message: string;
}

export interface SetupPasswordRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  requiresPasswordSetup?: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    student?: {
      id: number;
      fullname: string;
      batchId: number | null;
      batchName: string | null;
    };
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthenticatedRequest {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  student?: {
    id: number;
    fullname: string;
    batchId: number | null;
    batch: {
      id: number;
      name: string;
    } | null;
  };
}
