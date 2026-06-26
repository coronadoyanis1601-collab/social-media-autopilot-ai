import { Router } from 'express';
import { supabase } from '../services/supabase';
import { generateImprovementReport } from '../services/openai';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { content_id, platform } = req.query;
    let query = supabase.from('analytics').select('*').order('collected_at', { ascending: false });
    if (content_id) query = query.eq('content_id', content_id);
    if (platform) query = query.eq('platform', platform);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('analytics').insert([req.body]).select().single();
    if (error) throw error;
    if (data) {
      // Generate improvement report
      try {
        const report = await generateImprovementReport({
          platform: data.platform,
          views: data.views,
          likes: data.likes,
          comments: data.comments,
          shares: data.shares,
          engagement_rate: data.engagement_rate,
          retention_rate: data.retention_rate,
          predicted_score: data.predicted_score,
        });
        await supabase.from('analytics').update({ improvement_report: report }).eq('id', data.id);
        await supabase.from('contents').update({ status: 'Analysé' }).eq('id', data.content_id);
      } catch (aiErr) {
        console.error('AI report error (non-blocking):', aiErr);
      }
    }
    res.status(201).json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('analytics').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('analytics').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
