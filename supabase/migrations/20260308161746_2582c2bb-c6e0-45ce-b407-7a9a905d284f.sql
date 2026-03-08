-- Create table for page sections content
CREATE TABLE public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  content JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for resources/links that can be added to each section
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES public.page_sections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can view page sections" ON public.page_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can view resources" ON public.resources FOR SELECT USING (true);

-- Only admin can modify (check by email)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'silvestersss89@gmail.com'
  )
$$;

CREATE POLICY "Admin can insert page sections" ON public.page_sections FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update page sections" ON public.page_sections FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete page sections" ON public.page_sections FOR DELETE USING (public.is_admin());

CREATE POLICY "Admin can insert resources" ON public.resources FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update resources" ON public.resources FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete resources" ON public.resources FOR DELETE USING (public.is_admin());

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial sections
INSERT INTO public.page_sections (section_key, title, sort_order) VALUES
  ('hero', '首頁橫幅', 0),
  ('stats', '數據一覽', 1),
  ('topics', '探索主題', 2),
  ('articles', '精選文章', 3),
  ('quotes', '思想之光', 4),
  ('footer', '頁腳', 5);