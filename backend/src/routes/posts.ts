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
    const { data, error } = await supabase.from('generated_posts').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/generate', async (req, res) => {
  try {
    const { content_id, platforms } = req.body;
    if (!content_id || !platforms?.length) {
      return res.status(400).json({ error: 'content_id and platforms required' });
    }

    const { data: content } = await supabase.from('contents').select('*').eq('id', content_id).single();
    if (!content) return res.status(404).json({ error: 'Content not found' });

    const results = [];
    for (const platform of platforms) {
      try {
        const generated = await generatePlatformContent(platform, {
          title: content.title,
          original_text: content.original_text,
          subject: content.subject,
          target_audience: content.target_audience,
          emotion: content.emotion,
        });

        const postData = {
          content_id,
          platform,
          status: 'À valider',
          hook: generated.hook || '',
          caption: generated.caption || '',
          caption_short: generated.caption_short || '',
          caption_storytelling: generated.caption_storytelling || '',
          hashtags: Array.isArray(generated.hashtags) ? generated.hashtags.join(' ') : '',
          call_to_action: generated.call_to_action || '',
          title: generated.title || '',
          description: generated.description || '',
          script: generated.script || '',
          on_screen_text: generated.on_screen_text || '',
          editing_recommendations: generated.editing_recommendations || '',
          cover_idea: generated.cover_idea || '',
          music_suggestion: generated.music_suggestion || '',
          recommended_format: generated.recommended_format || '',
          recommended_duration: generated.recommended_duration || '',
          pinned_comment: generated.pinned_comment || '',
          thread_tweets: Array.isArray(generated.thread_tweets) ? generated.thread_tweets : [],
          seo_tags: Array.isArray(generated.seo_tags) ? generated.seo_tags : [],
          chapters: generated.chapters || '',
          is_compliant: true,
          compliance_warnings: '',
        };

        const { data: post, error } = await supabase.from('generated_posts').insert([postData]).select().single();
        if (!error && post) results.push(post);
      } catch (platformErr) {
        console.error(`Error generating for ${platform}:`, platformErr);
      }
    }

    res.status(201).json({ data: results, count: results.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/regenerate', async (req, res) => {
  try {
    const { data: post, error: postErr } = await supabase.from('generated_posts').select('*').eq('id', req.params.id).single();
    if (postErr || !post) return res.status(404).json({ error: 'Post not found' });

    const { data: content } = await supabase.from('contents').select('*').eq('id', post.content_id).single();
    if (!content) return res.status(404).json({ error: 'Content not found' });

    const generated = await generatePlatformContent(post.platform, {
      title: content.title,
      original_text: content.original_text,
      subject: content.subject,
      target_audience: content.target_audience,
      emotion: content.emotion,
    });

    const { data, error } = await supabase.from('generated_posts').update({
      hook: generated.hook || '',
      caption: generated.caption || '',
      caption_short: generated.caption_short || '',
      hashtags: Array.isArray(generated.hashtags) ? generated.hashtags.join(' ') : '',
      call_to_action: generated.call_to_action || '',
      script: generated.script || '',
      status: 'À valider',
    }).eq('id', req.params.id).select().single();

    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('generated_posts').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
