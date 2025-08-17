import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { topic, difficulty, level, count } = await req.json();
    
    console.log('Generating questions with params:', { topic, difficulty, level, count });

    const prompt = `Generate ${count} interview questions for ${topic} with ${difficulty} difficulty for ${level} level.

Format the response as a JSON array of objects with the following structure:
{
  "question": "The interview question text",
  "solution": "Clear and detailed explanation/solution in HTML format",
  "difficulty": "${difficulty}",
  "level": "${level}",
  "topic": "${topic}"
}

Requirements:
- Questions should be relevant for ${level} developers
- Difficulty should match ${difficulty} level
- Solutions should include code examples where applicable
- Use proper HTML formatting for solutions (p, pre, code, strong, em tags)
- Questions should be practical and commonly asked in interviews
- Ensure variety in question types (conceptual, practical, coding)

Return only the JSON array, no additional text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
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
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Content:', generatedContent);
      throw new Error('Failed to parse generated questions');
    }

    // Validate the response format
    if (!Array.isArray(questions)) {
      throw new Error('Generated content is not an array');
    }

    // Ensure each question has required fields
    const validatedQuestions = questions.map((q, index) => ({
      question: q.question || `Generated question ${index + 1}`,
      solution: q.solution || 'Solution not provided',
      difficulty: q.difficulty || difficulty,
      level: q.level || level,
      topic: q.topic || topic,
      id: `generated-${Date.now()}-${index}`
    }));

    console.log('Successfully generated questions:', validatedQuestions.length);

    return new Response(JSON.stringify({ 
      questions: validatedQuestions,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});