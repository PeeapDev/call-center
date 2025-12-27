'use client';

import { useState, useCallback } from 'react';
import { api, ApiError, getErrorMessage } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';

interface UseApiOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: () => Promise<T | null>;
  reset: () => void;
}

export function useApiGet<T>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { showToast } = useToast();

  const {
    showSuccessToast = false,
    successMessage = 'Data loaded successfully',
    showErrorToast = true,
  } = options;

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.get<T>(endpoint);
      setData(result);
      if (showSuccessToast) {
        showToast(successMessage, 'success');
      }
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(getErrorMessage(err), 0, err);
      setError(apiError);
      if (showErrorToast) {
        showToast(getErrorMessage(err), 'error');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, showSuccessToast, successMessage, showErrorToast, showToast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

export function useApiMutation<TData, TBody = unknown>(
  method: 'post' | 'put' | 'patch' | 'delete',
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { showToast } = useToast();

  const {
    showSuccessToast = true,
    successMessage = 'Operation completed successfully',
    showErrorToast = true,
  } = options;

  const execute = useCallback(
    async (body?: TBody): Promise<TData | null> => {
      setLoading(true);
      setError(null);

      try {
        let result: TData;
        if (method === 'delete') {
          result = await api.delete<TData>(endpoint);
        } else {
          result = await api[method]<TData>(endpoint, body);
        }
        setData(result);
        if (showSuccessToast) {
          showToast(successMessage, 'success');
        }
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError
          ? err
          : new ApiError(getErrorMessage(err), 0, err);
        setError(apiError);
        if (showErrorToast) {
          showToast(getErrorMessage(err), 'error');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [method, endpoint, showSuccessToast, successMessage, showErrorToast, showToast]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// Convenience hooks
export function usePost<TData, TBody = unknown>(
  endpoint: string,
  options?: UseApiOptions
) {
  return useApiMutation<TData, TBody>('post', endpoint, options);
}

export function usePut<TData, TBody = unknown>(
  endpoint: string,
  options?: UseApiOptions
) {
  return useApiMutation<TData, TBody>('put', endpoint, options);
}

export function useDelete<TData>(endpoint: string, options?: UseApiOptions) {
  return useApiMutation<TData>('delete', endpoint, options);
}

// Hook for handling async operations with loading and error states
export function useAsyncOperation<T>(options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const {
    showSuccessToast = true,
    successMessage = 'Operation completed successfully',
    showErrorToast = true,
  } = options;

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation();
        if (showSuccessToast) {
          showToast(successMessage, 'success');
        }
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        if (showErrorToast) {
          showToast(errorMessage, 'error');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccessToast, successMessage, showErrorToast, showToast]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, execute, clearError };
}
