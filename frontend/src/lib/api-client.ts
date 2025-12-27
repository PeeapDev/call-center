// Centralized API client with error handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// User-friendly error messages based on status codes and error types
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data. Please refresh and try again.';
      case 422:
        return 'The provided data is invalid. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'A server error occurred. Our team has been notified.';
      case 502:
      case 503:
      case 504:
        return 'The service is temporarily unavailable. Please try again in a few minutes.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('network') || error.message.includes('Network')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return 'The request timed out. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

// API request wrapper with automatic error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data.message
        ? data.message
        : `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(getErrorMessage(error), 0, error);
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Error boundary helper for async operations
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  onError?: (error: ApiError) => void
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const apiError = error instanceof ApiError
      ? error
      : new ApiError(getErrorMessage(error), 0, error);

    if (onError) {
      onError(apiError);
    }
    return null;
  }
}

// Validation helpers
export const validators = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isPhone: (phone: string): boolean => {
    // Sierra Leone phone format: +232 XX XXX XXXX or 0XX XXX XXXX
    const phoneRegex = /^(\+232|0)?[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  isStudentId: (id: string): boolean => {
    // Alphanumeric student ID
    return /^[A-Z0-9]{6,12}$/i.test(id);
  },

  isRequired: (value: string | undefined | null): boolean => {
    return value !== undefined && value !== null && value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },
};

// Form validation helper
export interface ValidationRule {
  validator: (value: string) => boolean;
  message: string;
}

export function validateField(
  value: string,
  rules: ValidationRule[]
): string | null {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
}

export function validateForm<T extends Record<string, string>>(
  values: T,
  fieldRules: Partial<Record<keyof T, ValidationRule[]>>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const [field, rules] of Object.entries(fieldRules)) {
    if (rules) {
      const error = validateField(values[field as keyof T] || '', rules as ValidationRule[]);
      if (error) {
        errors[field as keyof T] = error;
      }
    }
  }

  return errors;
}
