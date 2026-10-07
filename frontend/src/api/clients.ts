import { http } from './http';

/** Mirrors the backend's ClientRead schema (GET /clients/me). Dates are ISO strings. */
export interface Client {
  id: string;
  created_at: string;
  last_seen_at: string;
}

/** Registers (or refreshes) this browser on the backend and returns its record. */
export async function getCurrentClient(): Promise<Client> {
  const { data } = await http.get<Client>('/clients/me');
  return data;
}
