import { supabase } from '@/integrations/supabase/client';
import { 
  GeneratedQuestion, 
  GenerateRequest, 
  QuestionsSchema,
  AIParseError,
  AIProviderError,
  AIRateLimitError 
} from '@/lib/schemas';

export interface GenerateQuestionsParams {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'fresher' | 'junior' | 'senior';
  count: number;
  provider?: 'openai' | 'gemini';
}

export interface GenerateQuestionsResponse {
  questions: GeneratedQuestion[];
  metadata: {
    provider: string;
    fallbackUsed: boolean;
    duration: number;
  };
}

export class AIProviderService {
  private static readonly CACHE_DURATION = 3600000; // 1 hour
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY = 1000;

  /**
   * Generate questions using AI via Supabase Edge Function
   */
  static async generateQuestions(params: GenerateQuestionsParams): Promise<GenerateQuestionsResponse> {
    // Check cache first
    const cacheKey = this.getCacheKey(params);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.callEdgeFunction(params);
      
      // Validate and parse response
      const result = this.parseAndValidateResponse(response);
      
      // Cache successful results
      this.saveToCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('AI generation failed:', error);
      throw this.normalizeError(error);
    }
  }

  /**
   * Test AI provider connectivity
   */
  static async testProvider(provider: 'openai' | 'gemini'): Promise<{ success: boolean; message: string }> {
    try {
      const testParams: GenerateQuestionsParams = {
        topic: 'JavaScript',
        difficulty: 'easy',
        level: 'junior',
        count: 1,
        provider
      };

      await this.callEdgeFunction(testParams);
      return { 
        success: true, 
        message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} connection successful` 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || `Failed to connect to ${provider}` 
      };
    }
  }

  /**
   * Call the Supabase Edge Function with retry logic
   */
  private static async callEdgeFunction(params: GenerateQuestionsParams): Promise<any> {
    return this.withRetry(async () => {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: params
      });

      if (error) {
        throw new AIProviderError(error.message, params.provider);
      }

      if (data.error) {
        if (data.error.includes('rate limit')) {
          throw new AIRateLimitError(data.error, params.provider);
        }
        throw new AIProviderError(data.error, params.provider);
      }

      return data;
    });
  }

  /**
   * Parse and validate AI response using Zod
   */
  private static parseAndValidateResponse(response: any): GenerateQuestionsResponse {
    try {
      // If response has questions directly, validate it
      if (response.questions) {
        const validated = QuestionsSchema.parse(response);
        return {
          questions: validated.questions,
          metadata: response.metadata || {
            provider: 'unknown',
            fallbackUsed: false,
            duration: 0
          }
        };
      }

      // If response is the questions array directly
      if (Array.isArray(response)) {
        const validated = QuestionsSchema.parse({ questions: response });
        return {
          questions: validated.questions,
          metadata: {
            provider: 'unknown',
            fallbackUsed: false,
            duration: 0
          }
        };
      }

      throw new AIParseError('Response does not contain questions array');
    } catch (error) {
      if (error instanceof Error) {
        throw new AIParseError(
          `Failed to parse AI response: ${error.message}`,
          JSON.stringify(response).substring(0, 500)
        );
      }
      throw new AIParseError('Unknown parsing error');
    }
  }

  /**
   * Retry function with exponential backoff
   */
  private static async withRetry<T>(
    fn: () => Promise<T>, 
    retries = this.MAX_RETRIES, 
    baseDelayMs = this.BASE_DELAY
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        const errorMsg = `${error?.message || ""}`.toLowerCase();
        const isRateLimit = errorMsg.includes("rate limit") || errorMsg.includes("429");
        const isServerError = errorMsg.includes("5") || error?.status >= 500;
        
        // Only retry on rate limits or server errors
        if (i < retries - 1 && (isRateLimit || isServerError)) {
          const delay = baseDelayMs * Math.pow(2, i);
          console.log(`Retrying in ${delay}ms (attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
    
    throw lastError;
  }

  /**
   * Generate cache key for request
   */
  private static getCacheKey(params: GenerateQuestionsParams): string {
    const key = `ai_questions_${params.topic}_${params.difficulty}_${params.level}_${params.count}_${params.provider || 'auto'}`;
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Get cached result if still valid
   */
  private static getFromCache(key: string): GenerateQuestionsResponse | null {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.CACHE_DURATION) {
          return data.result;
        }
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
      localStorage.removeItem(key);
    }
    return null;
  }

  /**
   * Save result to cache
   */
  private static saveToCache(key: string, result: GenerateQuestionsResponse): void {
    try {
      const cacheData = {
        result,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
      // Don't fail if caching fails
    }
  }

  /**
   * Normalize different error types
   */
  private static normalizeError(error: any): Error {
    if (error instanceof AIParseError || error instanceof AIProviderError || error instanceof AIRateLimitError) {
      return error;
    }

    const message = error?.message || 'Unknown error occurred';
    
    if (message.includes('rate limit') || message.includes('429')) {
      return new AIRateLimitError(message);
    }
    
    if (message.includes('parse') || message.includes('JSON')) {
      return new AIParseError(message);
    }
    
    return new AIProviderError(message);
  }
}

// Legacy exports for backward compatibility
export interface AIQuestion extends GeneratedQuestion {}
export interface AIProviderConfig {
  provider: 'openai' | 'gemini';
  openaiApiKey?: string;
  geminiApiKey?: string;
}