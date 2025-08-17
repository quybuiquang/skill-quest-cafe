/*
  # AI Settings and Generation History Tables

  1. New Tables
    - `ai_settings` - Global AI provider configuration (admin only)
      - `id` (uuid, primary key)
      - `default_provider` (text, openai or gemini)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
    - `ai_generations` - History of AI generation requests
      - `id` (uuid, primary key)
      - `provider` (text)
      - `topic`, `difficulty`, `level`, `count` (request parameters)
      - `status` (success or error)
      - `error_msg` (text, nullable)
      - `duration_ms` (integer)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Only admins can manage ai_settings
    - Only admins can view ai_generations
    - Server-side inserts for ai_generations

  3. Initial Data
    - Seed default ai_settings row with OpenAI as default provider
*/

-- Create ai_settings table for global AI configuration
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  default_provider TEXT NOT NULL CHECK (default_provider IN ('openai', 'gemini')) DEFAULT 'openai',
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_generations table for tracking generation history
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  level TEXT NOT NULL CHECK (level IN ('fresher', 'junior', 'senior')),
  count INTEGER NOT NULL CHECK (count >= 1 AND count <= 20),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')) DEFAULT 'success',
  error_msg TEXT,
  duration_ms INTEGER,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_settings
CREATE POLICY "Only admins can view ai_settings"
  ON public.ai_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can manage ai_settings"
  ON public.ai_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS policies for ai_generations
CREATE POLICY "Only admins can view ai_generations"
  ON public.ai_generations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Server can insert ai_generations"
  ON public.ai_generations FOR INSERT
  WITH CHECK (true);

-- Create trigger for ai_settings updated_at
CREATE TRIGGER update_ai_settings_updated_at 
  BEFORE UPDATE ON public.ai_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default ai_settings if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ai_settings LIMIT 1) THEN
    -- Get the first admin user, or create a placeholder
    INSERT INTO public.ai_settings (default_provider, created_by)
    SELECT 'openai', user_id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- If no admin exists, we'll handle this in the application
    IF NOT FOUND THEN
      -- This will be handled by the application when first admin accesses settings
      NULL;
    END IF;
  END IF;
END $$;