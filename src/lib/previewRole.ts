import { useCallback, useEffect, useState } from 'react';

export type PreviewRole = 'administrador' | 'junta_directiva' | 'socio';

const STORAGE_KEY = 'acaspex_preview_role';
const EVENT_NAME = 'acaspex-preview-role-changed';

function getStored(): PreviewRole {
  if (typeof localStorage === 'undefined') return 'administrador';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'junta_directiva' || stored === 'socio' || stored === 'administrador') {
    return stored;
  }
  return 'administrador';
}

export function usePreviewRole() {
  const [previewRole, setPreviewRoleState] = useState<PreviewRole>(getStored);

  useEffect(() => {
    const handler = () => setPreviewRoleState(getStored());
    addEventListener(EVENT_NAME, handler);
    return () => removeEventListener(EVENT_NAME, handler);
  }, []);

  const setPreviewRole = useCallback((role: PreviewRole) => {
    localStorage.setItem(STORAGE_KEY, role);
    setPreviewRoleState(role);
    dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { previewRole, setPreviewRole };
}

export function getStoredPreviewRole(): PreviewRole {
  return getStored();
}
