
-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Environments table
CREATE TABLE public.environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check project ownership
CREATE OR REPLACE FUNCTION public.owns_project(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND user_id = _user_id
  )
$$;

CREATE POLICY "Users can view own environments" ON public.environments FOR SELECT TO authenticated USING (public.owns_project(auth.uid(), project_id));
CREATE POLICY "Users can create own environments" ON public.environments FOR INSERT TO authenticated WITH CHECK (public.owns_project(auth.uid(), project_id));
CREATE POLICY "Users can update own environments" ON public.environments FOR UPDATE TO authenticated USING (public.owns_project(auth.uid(), project_id));
CREATE POLICY "Users can delete own environments" ON public.environments FOR DELETE TO authenticated USING (public.owns_project(auth.uid(), project_id));

-- Environment variables table
CREATE TABLE public.environment_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id uuid NOT NULL REFERENCES public.environments(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  provider_hint text,
  ciphertext text NOT NULL,
  iv text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.environment_variables ENABLE ROW LEVEL SECURITY;

-- Security definer function to check environment ownership via project
CREATE OR REPLACE FUNCTION public.owns_environment(_user_id uuid, _environment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.environments e
    JOIN public.projects p ON p.id = e.project_id
    WHERE e.id = _environment_id AND p.user_id = _user_id
  )
$$;

CREATE POLICY "Users can view own env vars" ON public.environment_variables FOR SELECT TO authenticated USING (public.owns_environment(auth.uid(), environment_id));
CREATE POLICY "Users can create own env vars" ON public.environment_variables FOR INSERT TO authenticated WITH CHECK (public.owns_environment(auth.uid(), environment_id));
CREATE POLICY "Users can update own env vars" ON public.environment_variables FOR UPDATE TO authenticated USING (public.owns_environment(auth.uid(), environment_id));
CREATE POLICY "Users can delete own env vars" ON public.environment_variables FOR DELETE TO authenticated USING (public.owns_environment(auth.uid(), environment_id));

-- Add update triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_environments_updated_at BEFORE UPDATE ON public.environments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_env_variables_updated_at BEFORE UPDATE ON public.environment_variables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
