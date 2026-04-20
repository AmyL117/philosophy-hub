
-- 1. Roles table & helper
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can manage roles; users can read their own
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Refactor is_admin() to use roles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 3. Seed existing admins from auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email IN ('silvestersss89@gmail.com', 'amypy117@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Tighten videos SELECT policy by membership tier
DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;

CREATE POLICY "Tiered video access"
  ON public.videos FOR SELECT
  TO authenticated
  USING (
    access_tier = 'free'
    OR public.is_admin()
    OR (
      access_tier = 'paid'
      AND public.get_user_tier(auth.uid()) IN ('paid_member', 'premium_member')
    )
    OR (
      access_tier = 'premium'
      AND public.get_user_tier(auth.uid()) = 'premium_member'
    )
  );

-- 5. Lock down self-registration tier to free_member
DROP POLICY IF EXISTS "Users can register own membership" ON public.user_memberships;

CREATE POLICY "Users can register own membership as free"
  ON public.user_memberships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND tier = 'free_member'::public.membership_tier);
