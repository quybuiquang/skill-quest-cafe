import { z } from "zod";

// Schema for individual generated question
export const QuestionItemSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(20),
  solution: z.string().min(20),
  category: z.enum(["Algorithm", "Backend", "Frontend", "Database", "System Design", "DevOps"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  level: z.enum(["fresher", "junior", "senior"]),
});

// Schema for the complete AI response
export const QuestionsSchema = z.object({
  questions: z.array(QuestionItemSchema).min(1).max(50)
});

// Schema for AI generation request
export const GenerateRequestSchema = z.object({
  provider: z.enum(["openai", "gemini"]).optional(),
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  level: z.enum(["fresher", "junior", "senior"]),
  count: z.number().min(1).max(20)
});

// Schema for AI settings
export const AISettingsSchema = z.object({
  id: z.string().uuid(),
  default_provider: z.enum(["openai", "gemini"]),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string()
});

// Type exports
export type GeneratedQuestion = z.infer<typeof QuestionItemSchema>;
export type GeneratedQuestions = z.infer<typeof QuestionsSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type AISettings = z.infer<typeof AISettingsSchema>;

// Error types for better error handling
export class AIParseError extends Error {
  constructor(message: string, public originalResponse?: string) {
    super(message);
    this.name = 'AIParseError';
  }
}

export class AIProviderError extends Error {
  constructor(message: string, public provider?: string, public statusCode?: number) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class AIRateLimitError extends Error {
  constructor(message: string, public provider?: string) {
    super(message);
    this.name = 'AIRateLimitError';
  }
}