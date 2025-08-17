import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AISettings {
  id?: string;
  default_provider: 'openai' | 'gemini';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientAISettings {
  provider: 'openai' | 'gemini';
  openaiApiKey: string;
  geminiApiKey: string;
}

const DEFAULT_CLIENT_SETTINGS: ClientAISettings = {
  provider: 'openai',
  openaiApiKey: '',
  geminiApiKey: ''
};

export function useAISettings() {
  const [serverSettings, setServerSettings] = useState<AISettings | null>(null);
  const [clientSettings, setClientSettings] = useState<ClientAISettings>(DEFAULT_CLIENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      // Load server settings (admin only)
      if (user) {
        const { data: serverData, error: serverError } = await supabase
          .from('ai_settings')
          .select('*')
          .limit(1)
          .single();

        if (!serverError && serverData) {
          setServerSettings(serverData);
        }
      }

      // Load client settings from localStorage
      const saved = localStorage.getItem('ai_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setClientSettings({ ...DEFAULT_CLIENT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveServerSettings = async (settings: Partial<AISettings>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (serverSettings?.id) {
        // Update existing
        const { error } = await supabase
          .from('ai_settings')
          .update(settings)
          .eq('id', serverSettings.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('ai_settings')
          .insert({
            ...settings,
            created_by: user.id
          });

        if (error) throw error;
      }

      await loadSettings();
      return true;
    } catch (error) {
      console.error('Error saving server settings:', error);
      throw error;
    }
  };

  const saveClientSettings = (settings: Partial<ClientAISettings>) => {
    try {
      const updated = { ...clientSettings, ...settings };
      setClientSettings(updated);
      localStorage.setItem('ai_settings', JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving client settings:', error);
      return false;
    }
  };

  const clearClientSettings = () => {
    try {
      setClientSettings(DEFAULT_CLIENT_SETTINGS);
      localStorage.removeItem('ai_settings');
      return true;
    } catch (error) {
      console.error('Error clearing client settings:', error);
      return false;
    }
  };

  const isClientConfigured = () => {
    if (clientSettings.provider === 'openai') {
      return !!clientSettings.openaiApiKey;
    } else {
      return !!clientSettings.geminiApiKey;
    }
  };

  const getEffectiveProvider = (): 'openai' | 'gemini' => {
    // Use server setting if available, otherwise client setting
    return serverSettings?.default_provider || clientSettings.provider;
  };

  // Combined settings for backward compatibility
  const settings = {
    provider: getEffectiveProvider(),
    openaiApiKey: clientSettings.openaiApiKey,
    geminiApiKey: clientSettings.geminiApiKey
  };

  return {
    // Server settings (admin only)
    serverSettings,
    saveServerSettings,
    
    // Client settings (user level)
    clientSettings,
    saveClientSettings,
    clearClientSettings,
    
    // Combined/computed
    settings,
    loading,
    isConfigured: isClientConfigured,
    getEffectiveProvider
  };
}