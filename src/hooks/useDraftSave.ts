import { useState, useEffect, useCallback } from 'react';

interface DraftData {
  title?: string;
  content?: string;
  categoryId?: string;
  difficulty?: string;
  level?: string;
  timestamp?: number;
}

export function useDraftSave(key: string, initialData?: DraftData) {
  const [data, setData] = useState<DraftData>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`draft-${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        if (parsed.timestamp) {
          setLastSaved(new Date(parsed.timestamp));
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [key]);

  // Auto-save debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(data).length > 0) {
        saveDraft();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [data]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    
    try {
      const dataWithTimestamp = {
        ...data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`draft-${key}`, JSON.stringify(dataWithTimestamp));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, key]);

  const updateDraft = useCallback((updates: Partial<DraftData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft-${key}`);
    setData({});
    setLastSaved(null);
  }, [key]);

  const restoreDraft = useCallback(() => {
    const saved = localStorage.getItem(`draft-${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        if (parsed.timestamp) {
          setLastSaved(new Date(parsed.timestamp));
        }
        return parsed;
      } catch (error) {
        console.error('Error restoring draft:', error);
      }
    }
    return null;
  }, [key]);

  return {
    data,
    isSaving,
    lastSaved,
    updateDraft,
    saveDraft,
    clearDraft,
    restoreDraft
  };
}