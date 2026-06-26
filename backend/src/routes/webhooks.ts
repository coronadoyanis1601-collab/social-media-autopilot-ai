import { Router } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// Webhook endpoint for n8n/Make/Zapier to push analytics data
router.post('/analytics', async (req, res) => {
  try {
    const { content_id, platform, views, likes, comments, shares, saves, clicks, followers_gained, watch_time, retention_rate, engagement_rate, reach, impressions, published_at } = req.body;
    if (!content_id || !platform) return res.status(400).json({ error: 'content_id and platform required' });

    const { data, error } = await supabase.from('analytics').insert([{
      content_id, platform, views: views||0, likes: likes||0, comments: comments||0, shares: shares||0,
      saves: saves||0, clicks: clicks||0, followers_gained: followers_gained||0,
      watch_time: watch_time||0, retention_rate: retention_rate||0, engagement_rate: engagement_rate||0,
      reach: reach||0, impressions: impressions||0, published_at, collected_at: new Date().toISOString()
    }]).select().single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Webhook to trigger content publish confirmation
router.post('/publish-confirm', async (req, res) => {
  try {
    const { post_id, published_at } = req.body;
    await supabase.from('generated_posts').update({ status: 'Publié', published_at: published_at || new Date().toISOString() }).eq('id', post_id);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
