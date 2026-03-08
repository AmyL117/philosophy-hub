
-- Create membership tier enum
CREATE TYPE public.membership_tier AS ENUM ('free_member', 'paid_member', 'premium_member');

-- Create user_memberships table
CREATE TABLE public.user_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  display_name text,
  tier membership_tier NOT NULL DEFAULT 'free_member',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

-- Anyone can view their own membership
CREATE POLICY "Users can view own membership"
  ON public.user_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all memberships
CREATE POLICY "Admins can view all memberships"
  ON public.user_memberships
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert memberships
CREATE POLICY "Admins can insert memberships"
  ON public.user_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update memberships
CREATE POLICY "Admins can update memberships"
  ON public.user_memberships
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete memberships
CREATE POLICY "Admins can delete memberships"
  ON public.user_memberships
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Users can insert their own membership (for auto-registration)
CREATE POLICY "Users can register own membership"
  ON public.user_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Helper function to get current user's tier
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tier::text FROM public.user_memberships WHERE user_id = p_user_id LIMIT 1;
$$;

-- Update trigger for updated_at
CREATE TRIGGER update_user_memberships_updated_at
  BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
