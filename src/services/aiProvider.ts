export interface AIQuestion {
  question: string;
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'fresher' | 'junior' | 'senior';
  topic: string;
}

export interface AIProviderConfig {
  provider: 'openai' | 'gemini';
  openaiApiKey?: string;
  geminiApiKey?: string;
}

export interface GenerateQuestionsParams {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'fresher' | 'junior' | 'senior';
  count: number;
}

export class AIProviderService {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async generateQuestions(params: GenerateQuestionsParams): Promise<AIQuestion[]> {
    const cacheKey = `ai_questions_${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    let questions: AIQuestion[];
    
    if (this.config.provider === 'openai') {
      questions = await this.generateWithOpenAI(params);
    } else {
      questions = await this.generateWithGemini(params);
    }

    // Cache the results
    this.saveToCache(cacheKey, questions);
    
    return questions;
  }

  private async generateWithOpenAI(params: GenerateQuestionsParams): Promise<AIQuestion[]> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }

    const prompt = this.buildPrompt(params);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert technical interviewer who creates high-quality interview questions and detailed solutions. Always respond with valid JSON only.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseAIResponse(content, params);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate questions with OpenAI');
    }
  }

  private async generateWithGemini(params: GenerateQuestionsParams): Promise<AIQuestion[]> {
    if (!this.config.geminiApiKey) {
      throw new Error('Gemini API key is required');
    }

    const prompt = this.buildPrompt(params);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.config.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          }
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid Gemini API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Gemini API error: ${response.status}`);
        }
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      return this.parseAIResponse(content, params);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate questions with Gemini');
    }
  }

  private buildPrompt(params: GenerateQuestionsParams): string {
    return `Generate ${params.count} interview questions for ${params.topic} with ${params.difficulty} difficulty for ${params.level} level developers.

Format the response as a JSON array of objects with the following structure:
{
  "question": "The interview question text",
  "solution": "Clear and detailed explanation/solution in HTML format",
  "difficulty": "${params.difficulty}",
  "level": "${params.level}",
  "topic": "${params.topic}"
}

Requirements:
- Questions should be relevant for ${params.level} developers
- Difficulty should match ${params.difficulty} level
- Solutions should include code examples where applicable using <pre><code> tags
- Use proper HTML formatting for solutions (p, pre, code, strong, em tags)
- Questions should be practical and commonly asked in interviews
- Ensure variety in question types (conceptual, practical, coding)
- Make solutions comprehensive but concise

Return only the JSON array, no additional text.`;
  }

  private parseAIResponse(content: string, params: GenerateQuestionsParams): AIQuestion[] {
    try {
      // Clean the content to extract JSON
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      return questions.map((q: any, index: number) => ({
        question: q.question || `Generated question ${index + 1}`,
        solution: q.solution || 'Solution not provided',
        difficulty: q.difficulty || params.difficulty,
        level: q.level || params.level,
        topic: q.topic || params.topic
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  private getFromCache(key: string): AIQuestion[] | null {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        // Cache for 1 hour
        if (Date.now() - data.timestamp < 3600000) {
          return data.questions;
        }
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
    return null;
  }

  private saveToCache(key: string, questions: AIQuestion[]): void {
    try {
      localStorage.setItem(key, JSON.stringify({
        questions,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }
}