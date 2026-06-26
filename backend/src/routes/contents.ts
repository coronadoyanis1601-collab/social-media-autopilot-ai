import { Router } from 'express';
import { supabase } from '../services/supabase';
import { analyzeContent } from '../services/openai';

const router = Router();

// GET all contents
router.get('/', async (req, res) => {
  try {
    const { status, archived } = req.query;
    let query = supabase.from('contents').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (archived !== 'true') query = query.eq('is_archived', false);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data, count: data?.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET single content
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contents').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST create content
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contents').insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PATCH update content
router.patch('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contents').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE content
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('contents').update({ is_archived: true }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST analyze content with AI
router.post('/:id/analyze', async (req, res) => {
  try {
    const { data: content } = await supabase.from('contents').select('*').eq('id', req.params.id).single();
    const { data: brand } = await supabase.from('brand_settings').select('*').limit(1).single();
    const analysis = await analyzeContent({ ...content, brand });
    const { data, error } = await supabase.from('contents').update({
      subject: analysis.subject,
      target_audience: analysis.target_audience,
      emotion: analysis.emotion,
      hook_quality: analysis.hook_quality,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      flop_risks: analysis.flop_risks,
      improvement_suggestions: analysis.improvement_suggestions,
      viral_score: analysis.viral_score,
      viral_score_explanation: JSON.stringify({
        explanation: analysis.viral_score_explanation,
        breakdown: analysis.score_breakdown,
        boosts: analysis.what_boosts_score,
        limits: analysis.what_limits_score,
        changes: analysis.what_to_change
      }),
      ai_analysis: JSON.stringify(analysis),
      status: 'À valider'
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ content: data, analysis });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    const { data: contents } = await supabase.from('contents').select('status, viral_score, created_at').eq('is_archived', false);
    const { data: analytics } = await supabase.from('analytics').select('platform, engagement_rate, actual_performance_score');

    const stats = {
      total: contents?.length || 0,
      by_status: {} as any,
      avg_viral_score: 0,
      top_platform: '',
      weekly_contents: 0
    };

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const statuses = ['Brouillon','À améliorer','À valider','Validé','Programmé','Publié','Analysé'];
    statuses.forEach(s => { stats.by_status[s] = contents?.filter(c => c.status === s).length || 0; });

    const scored = contents?.filter(c => c.viral_score) || [];
    stats.avg_viral_score = scored.length ? Math.round(scored.reduce((a, c) => a + (c.viral_score || 0), 0) / scored.length) : 0;
    stats.weekly_contents = contents?.filter(c => new Date(c.created_at) > weekAgo).length || 0;

    if (analytics?.length) {
      const byPlatform: Record<string, number[]> = {};
      analytics.forEach(a => { if (!byPlatform[a.platform]) byPlatform[a.platform] = []; byPlatform[a.platform].push(a.engagement_rate || 0); });
      stats.top_platform = Object.entries(byPlatform).sort(([,a],[,b]) => b.reduce((s,v)=>s+v,0)/b.length - a.reduce((s,v)=>s+v,0)/a.length)[0]?.[0] || '';
    }

    res.json(stats);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
