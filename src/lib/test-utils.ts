import { GeneratedQuestion, QuestionsSchema, AIParseError } from './schemas';

/**
 * Test utilities for AI response parsing
 */
export class AIResponseParser {
  /**
   * Parse AI response with comprehensive error handling
   */
  static parseResponse(response: string): GeneratedQuestion[] {
    try {
      // Clean the response
      let cleaned = response.trim();
      
      // Remove code fences if present
      cleaned = cleaned.replace(/^```json\s*|\s*```$/g, "");
      cleaned = cleaned.replace(/^```\s*|\s*```$/g, "");
      
      // Try to extract JSON if wrapped in text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Parse JSON
      const parsed = JSON.parse(cleaned);
      
      // Validate with Zod
      let questionsData;
      if (parsed.questions) {
        questionsData = QuestionsSchema.parse(parsed);
      } else if (Array.isArray(parsed)) {
        questionsData = QuestionsSchema.parse({ questions: parsed });
      } else {
        throw new AIParseError('Response does not contain questions array');
      }

      return questionsData.questions;
    } catch (error) {
      if (error instanceof AIParseError) {
        throw error;
      }
      
      if (error instanceof SyntaxError) {
        throw new AIParseError(`Invalid JSON format: ${error.message}`, response);
      }
      
      if (error instanceof Error && error.message.includes('validation')) {
        throw new AIParseError(`Response validation failed: ${error.message}`, response);
      }
      
      throw new AIParseError(`Unknown parsing error: ${error}`, response);
    }
  }

  /**
   * Create mock questions for testing
   */
  static createMockQuestions(count: number = 3): GeneratedQuestion[] {
    const topics = ['JavaScript', 'React', 'Node.js', 'Database', 'System Design'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    const levels: ('fresher' | 'junior' | 'senior')[] = ['fresher', 'junior', 'senior'];
    const categories = ['Frontend', 'Backend', 'Database', 'Algorithm', 'System Design'];

    return Array.from({ length: count }, (_, i) => ({
      title: `Mock Interview Question ${i + 1}: ${topics[i % topics.length]}`,
      content: `<p>This is a mock question about ${topics[i % topics.length]} for testing purposes.</p><p>It includes detailed context and requirements.</p>`,
      solution: `<p>This is a comprehensive solution for the mock question.</p><pre><code>// Example code\nfunction example() {\n  return "mock solution";\n}</code></pre>`,
      category: categories[i % categories.length],
      difficulty: difficulties[i % difficulties.length],
      level: levels[i % levels.length]
    }));
  }

  /**
   * Validate question completeness
   */
  static validateQuestion(question: GeneratedQuestion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!question.title || question.title.length < 5) {
      errors.push('Title must be at least 5 characters');
    }

    if (!question.content || question.content.length < 20) {
      errors.push('Content must be at least 20 characters');
    }

    if (!question.solution || question.solution.length < 20) {
      errors.push('Solution must be at least 20 characters');
    }

    if (!['Algorithm', 'Backend', 'Frontend', 'Database', 'System Design', 'DevOps'].includes(question.category)) {
      errors.push('Invalid category');
    }

    if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push('Invalid difficulty');
    }

    if (!['fresher', 'junior', 'senior'].includes(question.level)) {
      errors.push('Invalid level');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}