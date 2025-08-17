import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface GenerateRequest {
  provider?: 'openai' | 'gemini';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'fresher' | 'junior' | 'senior';
  count: number;
}

interface QuestionItem {
  title: string;
  content: string;
  solution: string;
  category: string;
  difficulty: string;
  level: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const startTime = Date.now();
    const body: GenerateRequest = await req.json();
    
    // Validate request
    if (!body.topic || !body.difficulty || !body.level || !body.count) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: topic, difficulty, level, count" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.count < 1 || body.count > 20) {
      return new Response(
        JSON.stringify({ error: "Count must be between 1 and 20" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API keys from environment
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    // Determine which provider to use
    let provider = body.provider;
    if (!provider) {
      // Default to OpenAI if available, otherwise Gemini
      provider = openaiKey ? 'openai' : 'gemini';
    }

    // Validate provider availability
    if (provider === 'openai' && !openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (provider === 'gemini' && !geminiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt
    const schemaText = `Return ONLY JSON with this exact structure:
{
  "questions": [
    {
      "title": "string (max 200 chars, concise interview question)",
      "content": "string (detailed question description in HTML format)",
      "solution": "string (comprehensive solution/answer in HTML format with code examples)",
      "category": "Algorithm|Backend|Frontend|Database|System Design|DevOps",
      "difficulty": "${body.difficulty}",
      "level": "${body.level}"
    }
  ]
}`;

    const userPrompt = `Generate ${body.count} high-quality interview questions for topic="${body.topic}", difficulty="${body.difficulty}", level="${body.level}".

Requirements:
- Questions should be practical and commonly asked in real interviews
- Solutions must include detailed explanations and code examples where applicable
- Use HTML formatting for content and solution (p, pre, code, strong, em, ul, ol, li tags)
- Ensure variety in question types (conceptual, practical, coding challenges)
- Match the specified difficulty and experience level
- Questions should be relevant to Vietnamese developers

${schemaText}

CRITICAL: Output ONLY the JSON object. No additional text, explanations, or code fences.`;

    // Retry function with exponential backoff
    const withRetry = async <T>(fn: () => Promise<T>, retries = 3, baseDelayMs = 800): Promise<T> => {
      let lastError: any;
      
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (error: any) {
          lastError = error;
          const errorMsg = `${error?.message || ""}`.toLowerCase();
          const isRateLimit = errorMsg.includes("rate limit") || errorMsg.includes("429");
          const isServerError = errorMsg.includes("5") || error?.status >= 500;
          
          if (i < retries - 1 && (isRateLimit || isServerError)) {
            const delay = baseDelayMs * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          break;
        }
      }
      throw lastError;
    };

    // OpenAI implementation
    const generateWithOpenAI = async (): Promise<any> => {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "You are an expert technical interviewer who creates high-quality interview questions. Always respond with valid JSON only. Never include explanations or code fences."
            },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid OpenAI API key");
        } else if (response.status === 429) {
          throw new Error("OpenAI rate limit exceeded");
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      }

      const data = await response.json();
      let content = data.choices[0].message.content;
      
      // Clean the response
      content = content.trim();
      content = content.replace(/^```json\s*|\s*```$/g, "");
      content = content.replace(/^```\s*|\s*```$/g, "");
      
      return JSON.parse(content);
    };

    // Gemini implementation
    const generateWithGemini = async (): Promise<any> => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: userPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
              responseMimeType: "application/json"
            }
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Invalid Gemini API key");
        } else if (response.status === 429) {
          throw new Error("Gemini rate limit exceeded");
        } else {
          throw new Error(`Gemini API error: ${response.status}`);
        }
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      return JSON.parse(content);
    };

    // Main generation logic with fallback
    const enableFallback = true;
    let json: any;
    let usedProvider = provider;
    let fallbackUsed = false;

    try {
      const generateFn = provider === 'gemini' ? generateWithGemini : generateWithOpenAI;
      json = await withRetry(generateFn);
    } catch (error: any) {
      console.error(`Primary provider ${provider} failed:`, error.message);
      
      // Try fallback if enabled and other provider is available
      if (enableFallback) {
        const fallbackProvider = provider === 'gemini' ? 'openai' : 'gemini';
        const fallbackKey = fallbackProvider === 'openai' ? openaiKey : geminiKey;
        
        if (fallbackKey) {
          try {
            console.log(`Attempting fallback to ${fallbackProvider}`);
            const fallbackFn = fallbackProvider === 'gemini' ? generateWithGemini : generateWithOpenAI;
            json = await withRetry(fallbackFn);
            usedProvider = fallbackProvider;
            fallbackUsed = true;
          } catch (fallbackError: any) {
            console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError.message);
            throw error; // Throw original error
          }
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Validate response structure
    if (!json || !json.questions || !Array.isArray(json.questions)) {
      throw new Error("Invalid response structure from AI provider");
    }

    // Normalize the questions
    const questions: QuestionItem[] = json.questions.map((q: any, index: number) => ({
      title: q.title || `Generated question ${index + 1}`,
      content: q.content || 'Content not provided',
      solution: q.solution || 'Solution not provided',
      category: q.category || body.topic,
      difficulty: q.difficulty || body.difficulty,
      level: q.level || body.level
    }));

    const duration = Date.now() - startTime;

    // Log generation history (fire and forget)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Get user ID from auth header
      const authHeader = req.headers.get('Authorization');
      let userId = null;
      if (authHeader) {
        try {
          const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
          userId = user?.id;
        } catch (e) {
          console.warn('Could not get user from auth header');
        }
      }

      if (userId) {
        await supabase.from('ai_generations').insert({
          provider: usedProvider,
          topic: body.topic,
          difficulty: body.difficulty,
          level: body.level,
          count: body.count,
          status: 'success',
          duration_ms: duration,
          created_by: userId
        });
      }
    } catch (logError) {
      console.error('Failed to log generation history:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        questions,
        metadata: {
          provider: usedProvider,
          fallbackUsed,
          duration: duration
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error('Generation error:', error);
    
    // Log error (fire and forget)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const authHeader = req.headers.get('Authorization');
      let userId = null;
      if (authHeader) {
        try {
          const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
          userId = user?.id;
        } catch (e) {
          // Ignore auth errors for logging
        }
      }

      if (userId) {
        const body: GenerateRequest = await req.json();
        await supabase.from('ai_generations').insert({
          provider: body.provider || 'openai',
          topic: body.topic || 'unknown',
          difficulty: body.difficulty || 'medium',
          level: body.level || 'junior',
          count: body.count || 1,
          status: 'error',
          error_msg: error.message.substring(0, 500),
          duration_ms: Date.now() - Date.now(), // Will be 0 for errors
          created_by: userId
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate questions",
        details: "Please try again or contact support if the issue persists"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});