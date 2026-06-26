import { Router } from 'express';
import { supabase } from '../services/supabase';
import { generatePlatformContent } from '../services/openai';

const router = Router();
const PLATFORMS = ['Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat'];

router.get('/', async (req, res) => {
  try {
    const { content_id, platform, status } = req.query;
    let query = supabase.from('generated_posts').select('*').order('created_at', { ascending: false });
    if (content_id) query = query.eq('content_id', content_id);
    if (platform) query = query.eq('platform', platform);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('generated_posts').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    // Prevent auto-publishing: block status 'Publié' if not explicitly validated
    const { data, error } = await supabase.from('generated_posts').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Generate posts for specific platforms
router.post('/generate', async (req, res) => {
  try {
    const { content_id, platforms } = req.body;
    if (!content_id || !platforms?.length) return res.status(400).json({ error: 'content_id and platforms required' });

    const { data: content } = await supabase.from('contents').select('*').eq('id', content_id).single();
    const { data: brand } = await supabase.from('brand_settings').select('*').limit(1).single();
    const analysis = JSON.parse(content.ai_analysis || '{}');

    const results = [];
    for (const platform of platforms) {
      if (!PLATFORMS.includes(platform)) continue;
      const generated = await generatePlatformContent({ content, platform, analysis, brand });
      const postData = {
        content_id,
        platform,
        status: 'À valider',
        hook: generated.hook,
        caption: generated.caption,
        caption_short: generated.caption_short,
        caption_storytelling: generated.caption_storytelling,
        hashtags: generated.hashtags,
        call_to_action: generated.call_to_action,
        title: generated.title,
        description: generated.description,
        script: generated.script,
        on_screen_text: generated.on_screen_text,
        editing_recommendations: generated.editing_recommendations,
        cover_idea: generated.cover_idea,
        music_suggestion: generated.music_suggestion,
        recommended_format: generated.recommended_format,
        recommended_duration: generated.recommended_duration,
        pinned_comment: generated.pinned_comment,
        thread_tweets: generated.thread_tweets,
        seo_tags: generated.seo_tags,
        chapters: generated.chapters,
        is_compliant: generated.is_compliant !== false,
        compliance_warnings: generated.compliance_warnings || ''
      };
      const { data, error } = await supabase.from('generated_posts').insert([postData]).select().single();
      if (!error) results.push(data);
    }

    res.status(201).json({ data: results, count: results.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Regenerate a single post
router.post('/:id/regenerate', async (req, res) => {
  try {
    const { data: post } = await supabase.from('generated_posts').select('*, contents(*)').eq('id', req.params.id).single();
    const { data: brand } = await supabase.from('brand_settings').select('*').limit(1).single();
    const content = (post as any).contents;
    const analysis = JSON.parse(content.ai_analysis || '{}');

    const generated = await generatePlatformContent({ content, platform: post.platform, analysis, brand });
    const { data, error } = await supabase.from('generated_posts').update({
      ...generated,
      thread_tweets: generated.thread_tweets,
      status: 'À valider'
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
