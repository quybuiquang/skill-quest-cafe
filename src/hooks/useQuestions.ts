import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type Question = {
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

export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (name),
          profiles (display_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createQuestion = async (questionData: {
    title: string;
    content: string;
    category_id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    level: 'fresher' | 'junior' | 'senior';
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('questions')
      .insert({
        ...questionData,
        creator_id: user.id,
        status: 'pending'
      });

    if (error) throw error;
  };

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchCategories();
    }
  }, [user]);

  return {
    questions,
    categories,
    loading,
    fetchQuestions,
    fetchCategories,
    createQuestion
  };
}