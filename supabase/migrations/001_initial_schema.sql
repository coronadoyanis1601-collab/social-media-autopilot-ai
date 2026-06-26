-- Social Media Autopilot AI — Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contents table
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('photo','video','audio','text','idea','link','old_post')),
  media_url TEXT,
  original_text TEXT,
  target_platforms TEXT[],
  status TEXT DEFAULT 'Brouillon' CHECK (status IN ('Brouillon','À améliorer','À valider','Validé','Programmé','Publié','Analysé')),
  viral_score NUMERIC,
  viral_score_explanation TEXT,
  ai_analysis TEXT,
  subject TEXT,
  target_audience TEXT,
  emotion TEXT,
  hook_quality TEXT,
  strengths TEXT,
  weaknesses TEXT,
  flop_risks TEXT,
  improvement_suggestions TEXT,
  is_archived BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GeneratedPosts table
CREATE TABLE IF NOT EXISTS generated_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat')),
  status TEXT DEFAULT 'Brouillon' CHECK (status IN ('Brouillon','À améliorer','À valider','Validé','Programmé','Publié','Archivé')),
  caption TEXT,
  caption_short TEXT,
  caption_storytelling TEXT,
  hashtags TEXT,
  hook TEXT,
  call_to_action TEXT,
  title TEXT,
  description TEXT,
  script TEXT,
  on_screen_text TEXT,
  editing_recommendations TEXT,
  cover_idea TEXT,
  music_suggestion TEXT,
  recommended_format TEXT,
  recommended_duration TEXT,
  pinned_comment TEXT,
  thread_tweets JSONB,
  seo_tags TEXT,
  chapters TEXT,
  is_compliant BOOLEAN DEFAULT true,
  compliance_warnings TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  generated_post_id UUID REFERENCES generated_posts(id) ON DELETE SET NULL,
  platform TEXT CHECK (platform IN ('Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  watch_time NUMERIC DEFAULT 0,
  retention_rate NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  predicted_score NUMERIC,
  actual_performance_score NUMERIC,
  improvement_report TEXT,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BrandSettings table
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name TEXT,
  niche TEXT,
  target_audience TEXT,
  tone_of_voice TEXT DEFAULT 'Professionnel' CHECK (tone_of_voice IN ('Décontracté','Professionnel','Inspirant','Humoristique','Éducatif','Autoritaire','Empathique','Authentique')),
  content_language TEXT DEFAULT 'Français',
  forbidden_topics TEXT,
  main_offer TEXT,
  competitors TEXT,
  keywords TEXT,
  preferred_platforms TEXT[],
  brand_colors TEXT,
  brand_values TEXT,
  posting_frequency TEXT,
  content_pillars TEXT,
  active_integrations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_title TEXT NOT NULL,
  idea_description TEXT,
  platform TEXT,
  priority TEXT DEFAULT 'Moyenne' CHECK (priority IN ('Haute','Moyenne','Basse')),
  status TEXT DEFAULT 'Nouvelle' CHECK (status IN ('Nouvelle','En cours','Utilisée','Archivée')),
  source TEXT DEFAULT 'IA' CHECK (source IN ('IA','Manuelle','Analytics')),
  estimated_viral_score NUMERIC,
  content_format TEXT,
  hook_idea TEXT,
  keywords TEXT,
  inspiration_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON brand_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policies (open for service_role, authenticated users see all)
CREATE POLICY "Service role full access contents" ON contents FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated full access contents" ON contents FOR ALL TO authenticated USING (true);

CREATE POLICY "Service role full access posts" ON generated_posts FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated full access posts" ON generated_posts FOR ALL TO authenticated USING (true);

CREATE POLICY "Service role full access analytics" ON analytics FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated full access analytics" ON analytics FOR ALL TO authenticated USING (true);

CREATE POLICY "Service role full access brand" ON brand_settings FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated full access brand" ON brand_settings FOR ALL TO authenticated USING (true);

CREATE POLICY "Service role full access ideas" ON ideas FOR ALL TO service_role USING (true);
CREATE POLICY "Authenticated full access ideas" ON ideas FOR ALL TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX idx_generated_posts_content_id ON generated_posts(content_id);
CREATE INDEX idx_generated_posts_platform ON generated_posts(platform);
CREATE INDEX idx_analytics_content_id ON analytics(content_id);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_priority ON ideas(priority);
