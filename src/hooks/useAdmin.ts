import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AdminQuestion = {
  id: string;
  title: string;
  content: string;
  category_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'fresher' | 'junior' | 'senior';
  creator_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  categories: {
    name: string;
  };
  profiles: {
    display_name: string;
  };
};

export type UserProfile = {
  id: string;
  user_id: string;
  display_name: string;
  role: 'user' | 'admin';
  status: 'active' | 'locked';
  created_at: string;
  updated_at: string;
};

export function useAdmin() {
  const [pendingQuestions, setPendingQuestions] = useState<AdminQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<AdminQuestion[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPendingQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (name),
          profiles (display_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingQuestions(data || []);
    } catch (error) {
      console.error('Error fetching pending questions:', error);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (name),
          profiles (display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllQuestions(data || []);
    } catch (error) {
      console.error('Error fetching all questions:', error);
    }
  };

  const fetchUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProfiles(data || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  };

  const approveQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from('questions')
      .update({ status: 'approved' })
      .eq('id', questionId);

    if (error) throw error;
    await fetchPendingQuestions();
    await fetchAllQuestions();
  };

  const rejectQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from('questions')
      .update({ status: 'rejected' })
      .eq('id', questionId);

    if (error) throw error;
    await fetchPendingQuestions();
    await fetchAllQuestions();
  };

  const deleteQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    await fetchPendingQuestions();
    await fetchAllQuestions();
  };

  const toggleUserStatus = async (userId: string, newStatus: 'active' | 'locked') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('user_id', userId);

    if (error) throw error;
    await fetchUserProfiles();
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchPendingQuestions(),
        fetchAllQuestions(),
        fetchUserProfiles()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  return {
    pendingQuestions,
    allQuestions,
    userProfiles,
    loading,
    fetchPendingQuestions,
    fetchAllQuestions,
    fetchUserProfiles,
    approveQuestion,
    rejectQuestion,
    deleteQuestion,
    toggleUserStatus
  };
}