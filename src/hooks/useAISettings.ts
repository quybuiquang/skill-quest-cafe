import { useState, useEffect } from 'react';

export interface AISettings {
  provider: 'openai' | 'gemini';
  openaiApiKey: string;
  geminiApiKey: string;
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  openaiApiKey: '',
  geminiApiKey: ''
};

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('ai_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = (newSettings: Partial<AISettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      localStorage.setItem('ai_settings', JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving AI settings:', error);
      return false;
    }
  };

  const clearSettings = () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('ai_settings');
      return true;
    } catch (error) {
      console.error('Error clearing AI settings:', error);
      return false;
    }
  };

  const isConfigured = () => {
    if (settings.provider === 'openai') {
      return !!settings.openaiApiKey;
    } else {
      return !!settings.geminiApiKey;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    clearSettings,
    isConfigured
  };
}