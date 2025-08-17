import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIProviderService } from '../services/aiProvider';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('AI Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('AIProviderService', () => {
    it('should generate questions successfully', async () => {
      const mockResponse = {
        questions: [
          {
            title: "What is React?",
            content: "<p>Explain React framework</p>",
            solution: "<p>React is a JavaScript library for building user interfaces</p>",
            category: "Frontend",
            difficulty: "easy",
            level: "fresher"
          }
        ],
        metadata: {
          provider: 'openai',
          fallbackUsed: false,
          duration: 1500
        }
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null
      });

      const result = await AIProviderService.generateQuestions({
        topic: 'react',
        difficulty: 'easy',
        level: 'fresher',
        count: 1
      });

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].title).toBe("What is React?");
      expect(result.metadata.provider).toBe('openai');
    });

    it('should handle API errors gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { error: 'Rate limit exceeded' },
        error: null
      });

      await expect(
        AIProviderService.generateQuestions({
          topic: 'javascript',
          difficulty: 'medium',
          level: 'junior',
          count: 5
        })
      ).rejects.toThrow();
    });

    it('should test provider connectivity', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          questions: [{
            title: "Test Question",
            content: "<p>Test content</p>",
            solution: "<p>Test solution</p>",
            category: "Frontend",
            difficulty: "easy",
            level: "fresher"
          }],
          metadata: { provider: 'openai', fallbackUsed: false, duration: 500 }
        },
        error: null
      });

      const result = await AIProviderService.testProvider('openai');
      expect(result.success).toBe(true);
      expect(result.message).toContain('OpenAI');
    });

    it('should cache successful responses', async () => {
      const mockResponse = {
        questions: [
          {
            title: "Cached Question",
            content: "<p>Cached content</p>",
            solution: "<p>Cached solution</p>",
            category: "Backend",
            difficulty: "medium",
            level: "junior"
          }
        ],
        metadata: {
          provider: 'gemini',
          fallbackUsed: false,
          duration: 1200
        }
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null
      });

      const params = {
        topic: 'nodejs',
        difficulty: 'medium' as const,
        level: 'junior' as const,
        count: 1
      };

      // First call should hit the API
      const result1 = await AIProviderService.generateQuestions(params);
      expect(result1.questions).toHaveLength(1);

      // Second call should use cache (no additional API call)
      const result2 = await AIProviderService.generateQuestions(params);
      expect(result2.questions).toHaveLength(1);
      expect(result2.questions[0].title).toBe("Cached Question");

      // Should only have called the API once
      expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledTimes(1);
    });
  });
});