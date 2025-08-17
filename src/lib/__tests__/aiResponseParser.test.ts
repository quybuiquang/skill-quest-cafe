import { describe, it, expect } from 'vitest';
import { AIResponseParser } from '../test-utils';
import { AIParseError } from '../schemas';

describe('AIResponseParser', () => {
  describe('parseResponse', () => {
    it('should parse valid JSON response', () => {
      const validResponse = JSON.stringify({
        questions: [
          {
            title: "What is a closure in JavaScript?",
            content: "<p>Explain the concept of closures in JavaScript.</p>",
            solution: "<p>A closure is a function that has access to variables in its outer scope.</p>",
            category: "Frontend",
            difficulty: "medium",
            level: "junior"
          }
        ]
      });

      const result = AIResponseParser.parseResponse(validResponse);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("What is a closure in JavaScript?");
    });

    it('should parse JSON wrapped in code fences', () => {
      const wrappedResponse = `\`\`\`json
{
  "questions": [
    {
      "title": "Test Question",
      "content": "<p>Test content</p>",
      "solution": "<p>Test solution</p>",
      "category": "Algorithm",
      "difficulty": "easy",
      "level": "fresher"
    }
  ]
}
\`\`\``;

      const result = AIResponseParser.parseResponse(wrappedResponse);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test Question");
    });

    it('should parse direct questions array', () => {
      const arrayResponse = JSON.stringify([
        {
          title: "Direct Array Question",
          content: "<p>Direct array content</p>",
          solution: "<p>Direct array solution</p>",
          category: "Backend",
          difficulty: "hard",
          level: "senior"
        }
      ]);

      const result = AIResponseParser.parseResponse(arrayResponse);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Direct Array Question");
    });

    it('should throw AIParseError for invalid JSON', () => {
      const invalidJson = "This is not JSON";
      
      expect(() => {
        AIResponseParser.parseResponse(invalidJson);
      }).toThrow(AIParseError);
    });

    it('should throw AIParseError for missing questions field', () => {
      const noQuestions = JSON.stringify({
        data: "some data",
        status: "success"
      });
      
      expect(() => {
        AIResponseParser.parseResponse(noQuestions);
      }).toThrow(AIParseError);
    });

    it('should throw AIParseError for invalid question structure', () => {
      const invalidStructure = JSON.stringify({
        questions: [
          {
            title: "Too short", // Less than 5 chars
            content: "Short", // Less than 20 chars
            solution: "Short", // Less than 20 chars
            category: "InvalidCategory",
            difficulty: "invalid",
            level: "invalid"
          }
        ]
      });
      
      expect(() => {
        AIResponseParser.parseResponse(invalidStructure);
      }).toThrow(AIParseError);
    });

    it('should extract JSON from mixed text response', () => {
      const mixedResponse = `
Here are some questions for you:

{
  "questions": [
    {
      "title": "Mixed Response Question",
      "content": "<p>This question was extracted from mixed text</p>",
      "solution": "<p>This solution was also extracted</p>",
      "category": "Database",
      "difficulty": "medium",
      "level": "junior"
    }
  ]
}

Hope this helps!
      `;

      const result = AIResponseParser.parseResponse(mixedResponse);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Mixed Response Question");
    });
  });

  describe('createMockQuestions', () => {
    it('should create specified number of mock questions', () => {
      const questions = AIResponseParser.createMockQuestions(5);
      expect(questions).toHaveLength(5);
    });

    it('should create valid question structure', () => {
      const questions = AIResponseParser.createMockQuestions(1);
      const question = questions[0];
      
      expect(question.title).toBeDefined();
      expect(question.content).toBeDefined();
      expect(question.solution).toBeDefined();
      expect(question.category).toBeDefined();
      expect(question.difficulty).toBeDefined();
      expect(question.level).toBeDefined();
    });
  });

  describe('validateQuestion', () => {
    it('should validate correct question', () => {
      const validQuestion = {
        title: "Valid Question Title",
        content: "<p>This is a valid question content with enough characters</p>",
        solution: "<p>This is a valid solution with enough characters</p>",
        category: "Frontend" as const,
        difficulty: "medium" as const,
        level: "junior" as const
      };

      const result = AIResponseParser.validateQuestion(validQuestion);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      const invalidQuestion = {
        title: "Bad", // Too short
        content: "Short", // Too short
        solution: "Short", // Too short
        category: "InvalidCategory" as any,
        difficulty: "invalid" as any,
        level: "invalid" as any
      };

      const result = AIResponseParser.validateQuestion(invalidQuestion);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});