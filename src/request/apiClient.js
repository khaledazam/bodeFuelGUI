/**
 * apiClient.js – Single Axios instance for the whole application.
 *
 * WHAT CHANGED from the old approach:
 *   OLD: Every request function called includeToken() which mutated the
 *        GLOBAL axios.defaults object. Concurrent requests could collide.
 *   NEW: One axios.create() instance. Interceptors attach the token per-request
 *        on a cloned config object – fully safe for parallel requests.
 */

import axios from 'axios';
import { notification } from 'antd';

import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import codeMessage from './codeMessage';

// ─── 1. Create the instance once ────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ─── 2. Request interceptor – inject token ───────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const auth = storePersist.get('auth');
    if (auth?.current?.token) {
      config.headers['Authorization'] = `Bearer ${auth.current.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── 3. Response interceptor – handle auth errors & general errors ───────────
apiClient.interceptors.response.use(
  // ✅ Successful response – pass straight through
  (response) => response,

  // ❌ Error response
  (error) => {
    // No internet
    if (!navigator.onLine) {
      notification.error({
        message: 'No internet connection',
        description: 'Check your internet network and try again.',
        duration: 15,
      });
      return Promise.resolve({
        data: { success: false, result: null, message: 'No internet connection' },
      });
    }

    const { response } = error;

    // No response from server (CORS, server down, etc.)
    if (!response) {
      return Promise.resolve({
        data: { success: false, result: null, message: 'Cannot connect to the server' },
      });
    }

    // ─── 401 / JWT expired → logout without hard page reload ────────────────
    const jwtExpired = response?.data?.jwtExpired;
    const jwtError = response?.data?.error?.name === 'JsonWebTokenError';

    if (response.status === 401 || jwtExpired || jwtError) {
      // Clean persisted auth state
      storePersist.remove('auth');
      storePersist.remove('isLogout');

      // Lazy-import the store to avoid circular deps at module level.
      // We import dynamically so this file can be loaded before the store.
      import('@/redux/store').then(({ default: store }) => {
        // Dispatch the auth LOGOUT_SUCCESS action so Redux & the UI update
        // instantly – no hard redirect needed.
        store.dispatch({ type: 'LOGOUT_SUCCESS' });
      });

      notification.warning({
        message: 'Session expired',
        description: 'Your session has expired. Please log in again.',
        duration: 5,
      });

      // Return a resolved promise with a failure shape so callers don't throw.
      return Promise.resolve({
        data: { success: false, result: null, message: 'Session expired' },
      });
    }

    // ─── All other HTTP errors ───────────────────────────────────────────────
    const message = response?.data?.message;
    const errorText = message || codeMessage[response.status] || 'An error occurred';

    notification.error({
      message: `Request error ${response.status}`,
      description: errorText,
      duration: 20,
    });

    // Return a resolved promise so downstream code always gets an object back.
    return Promise.resolve({ data: response.data });
  }
);

export default apiClient;
