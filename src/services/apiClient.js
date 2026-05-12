import axios from 'axios';

import { API_BASE_URL } from '@/config/serverApiConfig';
import { getAccessToken, handleUnauthorizedSession } from './authSession';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const jwtExpired = error?.response?.data?.jwtExpired;
    const tokenErrorName = error?.response?.data?.error?.name;

    if (jwtExpired || status === 401 || tokenErrorName === 'JsonWebTokenError') {
      handleUnauthorizedSession();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
