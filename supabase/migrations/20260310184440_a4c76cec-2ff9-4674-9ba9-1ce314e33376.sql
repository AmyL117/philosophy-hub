
CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT '心理學',
  label TEXT NOT NULL,
  value TEXT,
  item_type TEXT NOT NULL DEFAULT 'text' CHECK (item_type IN ('text', 'number', 'date', 'image')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view content_items"
ON public.content_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage content_items"
ON public.content_items FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
