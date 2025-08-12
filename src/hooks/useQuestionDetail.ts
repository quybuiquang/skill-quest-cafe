import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type QuestionDetail = {
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

export type Solution = {
  id: string;
  content: string;
  question_id: string;
  author_id: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
  };
};

export type Comment = {
  id: string;
  content: string;
  parent_type: 'question' | 'solution';
  parent_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
  };
};

export type Like = {
  id: string;
  user_id: string;
  target_type: 'question' | 'solution';
  target_id: string;
  created_at: string;
};

export function useQuestionDetail(questionId: string | undefined) {
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQuestionDetail = async () => {
    if (!questionId || !user) return;

    try {
      // Fetch question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select(`
          *,
          categories (name),
          profiles (display_name)
        `)
        .eq('id', questionId)
        .eq('status', 'approved')
        .single();

      if (questionError) throw questionError;
      setQuestion(questionData);

      // Fetch solutions
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solutions')
        .select(`
          *,
          profiles (display_name)
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (solutionsError) throw solutionsError;
      setSolutions(solutionsData || []);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (display_name)
        `)
        .or(`parent_id.eq.${questionId},parent_id.in.(${solutionsData?.map(s => s.id).join(',') || ''})`)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      // Fetch likes
      const allTargetIds = [questionId, ...(solutionsData?.map(s => s.id) || [])];
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('*')
        .in('target_id', allTargetIds);

      if (likesError) throw likesError;
      setLikes(likesData || []);
    } catch (error) {
      console.error('Error fetching question detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSolution = async (content: string) => {
    if (!user || !questionId) throw new Error('User not authenticated or question not found');

    const { error } = await supabase
      .from('solutions')
      .insert({
        content,
        question_id: questionId,
        author_id: user.id
      });

    if (error) throw error;
    await fetchQuestionDetail();
  };

  const addComment = async (content: string, parentType: 'question' | 'solution', parentId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comments')
      .insert({
        content,
        parent_type: parentType,
        parent_id: parentId,
        author_id: user.id
      });

    if (error) throw error;
    await fetchQuestionDetail();
  };

  const toggleLike = async (targetType: 'question' | 'solution', targetId: string) => {
    if (!user) throw new Error('User not authenticated');

    const existingLike = likes.find(
      like => like.user_id === user.id && like.target_type === targetType && like.target_id === targetId
    );

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) throw error;
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          target_type: targetType,
          target_id: targetId
        });

      if (error) throw error;
    }

    await fetchQuestionDetail();
  };

  const hasLiked = (targetType: 'question' | 'solution', targetId: string) => {
    return likes.some(
      like => like.user_id === user?.id && like.target_type === targetType && like.target_id === targetId
    );
  };

  useEffect(() => {
    fetchQuestionDetail();
  }, [questionId, user]);

  return {
    question,
    solutions,
    comments,
    likes,
    loading,
    fetchQuestionDetail,
    addSolution,
    addComment,
    toggleLike,
    hasLiked
  };
}