
-- Create api_tokens table for CLI/extension authentication
CREATE TABLE public.api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  token_hash text NOT NULL,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view own tokens
CREATE POLICY "Users can view own tokens"
ON public.api_tokens FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create own tokens
CREATE POLICY "Users can create own tokens"
ON public.api_tokens FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete own tokens
CREATE POLICY "Users can delete own tokens"
ON public.api_tokens FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
