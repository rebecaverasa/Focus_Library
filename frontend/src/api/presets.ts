import { http } from './http';

/** Mirrors the backend PresetRead schema: a name plus the six levels (0–100). */
export interface Preset {
  id: string;
  name: string;
  pages: number;
  rain: number;
  clock: number;
  whispers: number;
  fire: number;
  keys: number;
}

export type PresetInput = Omit<Preset, 'id'>;

export async function listPresets(): Promise<Preset[]> {
  const { data } = await http.get<Preset[]>('/presets');
  return data;
}

export async function createPreset(input: PresetInput): Promise<Preset> {
  const { data } = await http.post<Preset>('/presets', input);
  return data;
}

export async function updatePreset(id: string, patch: Partial<PresetInput>): Promise<Preset> {
  const { data } = await http.patch<Preset>(`/presets/${id}`, patch);
  return data;
}

export async function deletePreset(id: string): Promise<void> {
  await http.delete(`/presets/${id}`);
}
