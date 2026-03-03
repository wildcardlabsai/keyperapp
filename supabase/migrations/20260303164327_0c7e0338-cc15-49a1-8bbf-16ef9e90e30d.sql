
-- Create team_role enum
CREATE TYPE public.team_role AS ENUM ('owner', 'editor', 'viewer');

-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted boolean NOT NULL DEFAULT false,
  UNIQUE(team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team keys table (same encryption structure as api_keys)
CREATE TABLE public.team_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  added_by uuid NOT NULL,
  name text NOT NULL,
  service text NOT NULL DEFAULT 'Other',
  environment text NOT NULL DEFAULT 'Production',
  encrypted_key text NOT NULL,
  iv text NOT NULL,
  tags text DEFAULT '',
  notes_encrypted text DEFAULT '',
  notes_iv text DEFAULT '',
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.team_keys ENABLE ROW LEVEL SECURITY;

-- Security definer function: check if user is a member of a team
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND accepted = true
  )
$$;

-- Security definer: check team role
CREATE OR REPLACE FUNCTION public.has_team_role(_user_id uuid, _team_id uuid, _role team_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role = _role AND accepted = true
  )
$$;

-- RLS for teams: members can view their teams
CREATE POLICY "Members can view their teams"
ON public.teams FOR SELECT
USING (public.is_team_member(auth.uid(), id) OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update teams"
ON public.teams FOR UPDATE
USING (public.has_team_role(auth.uid(), id, 'owner'));

CREATE POLICY "Owners can delete teams"
ON public.teams FOR DELETE
USING (public.has_team_role(auth.uid(), id, 'owner'));

-- RLS for team_members
CREATE POLICY "Members can view team members"
ON public.team_members FOR SELECT
USING (public.is_team_member(auth.uid(), team_id) OR user_id = auth.uid());

CREATE POLICY "Owners can manage members"
ON public.team_members FOR INSERT
WITH CHECK (public.has_team_role(auth.uid(), team_id, 'owner') OR auth.uid() = user_id);

CREATE POLICY "Owners can update members"
ON public.team_members FOR UPDATE
USING (public.has_team_role(auth.uid(), team_id, 'owner') OR auth.uid() = user_id);

CREATE POLICY "Owners can remove members"
ON public.team_members FOR DELETE
USING (public.has_team_role(auth.uid(), team_id, 'owner'));

-- RLS for team_keys
CREATE POLICY "Team members can view keys"
ON public.team_keys FOR SELECT
USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors and owners can add keys"
ON public.team_keys FOR INSERT
WITH CHECK (
  public.has_team_role(auth.uid(), team_id, 'owner') OR
  public.has_team_role(auth.uid(), team_id, 'editor')
);

CREATE POLICY "Editors and owners can update keys"
ON public.team_keys FOR UPDATE
USING (
  public.has_team_role(auth.uid(), team_id, 'owner') OR
  public.has_team_role(auth.uid(), team_id, 'editor')
);

CREATE POLICY "Owners can delete keys"
ON public.team_keys FOR DELETE
USING (public.has_team_role(auth.uid(), team_id, 'owner'));
