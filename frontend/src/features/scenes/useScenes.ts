import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPreset, deletePreset, updatePreset } from '@/api/presets';
import type { Preset } from '@/api/presets';
import type { Levels } from '@/audio';
import { toInput } from './sceneState';
import { loadScenes } from './seedScenes';

export const scenesKey = ['presets'] as const;

export function useScenes() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: scenesKey });

  const query = useQuery({ queryKey: scenesKey, queryFn: loadScenes, staleTime: Infinity });

  const save = useMutation({
    mutationFn: ({ name, levels }: { name: string; levels: Levels }) =>
      createPreset(toInput(name, levels)),
    onSuccess: (created) =>
      client.setQueryData<Preset[]>(scenesKey, (list) => [...(list ?? []), created]),
    onSettled: refresh,
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updatePreset(id, { name }),
    onSuccess: (updated) =>
      client.setQueryData<Preset[]>(scenesKey, (list) =>
        list?.map((p) => (p.id === updated.id ? updated : p)),
      ),
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePreset(id),
    onSuccess: (_d, id) =>
      client.setQueryData<Preset[]>(scenesKey, (list) => list?.filter((p) => p.id !== id)),
    onSettled: refresh,
  });

  return { query, save, rename, remove };
}
