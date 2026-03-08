
-- Create video access tier enum
CREATE TYPE public.video_access_tier AS ENUM ('free', 'paid', 'premium');

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  drive_link TEXT NOT NULL,
  drive_file_id TEXT,
  category TEXT NOT NULL DEFAULT '心理學',
  access_tier video_access_tier NOT NULL DEFAULT 'free',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view videos (access control handled in app)
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);

-- Only admins can manage videos
CREATE POLICY "Admins can insert videos" ON public.videos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update videos" ON public.videos FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete videos" ON public.videos FOR DELETE USING (is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
