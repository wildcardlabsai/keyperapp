
-- Add onboarding_completed to profiles
ALTER TABLE public.profiles ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;

-- Add expires_at to api_keys
ALTER TABLE public.api_keys ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;
