import axios from 'axios';
import { getClientId } from './clientId';

export const CLIENT_ID_HEADER = 'X-Client-Id';

const DEFAULT_API_URL = 'http://localhost:8000';

/** Shared axios instance for every backend call. */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
});

// Every route on the backend resolves the browser from this header (BE-30).
http.interceptors.request.use((config) => {
  config.headers.set(CLIENT_ID_HEADER, getClientId());
  return config;
});
