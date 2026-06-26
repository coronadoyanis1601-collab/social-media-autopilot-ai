import { Router } from 'express';
import { supabase } from '../services/supabase';
import { generateImprovementReport } from '../services/openai';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { content_id, platform } = req.query;
    let query = supabase.from('analytics').select('*').order('created_at', { ascending: false });
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
    // Trigger improvement report generation
    if (data) {
      const { data: content } = await supabase.from('contents').select('*').eq('id', data.content_id).single();
      if (content) {
        const report = await generateImprovementReport({ content, analytics: data, predicted_score: content.viral_score });
        await supabase.from('analytics').update({ improvement_report: JSON.stringify(report) }).eq('id', data.id);
        // Add new ideas from report
        if (report.new_ideas?.length) {
          const ideas = report.new_ideas.map((i: any) => ({
            idea_title: i.title,
            idea_description: i.description,
            content_format: i.format,
            hook_idea: i.hook,
            source: 'Analytics',
            priority: 'Haute',
            status: 'Nouvelle',
            platform: data.platform
          }));
          await supabase.from('ideas').insert(ideas);
        }
        // Update content status to Analysé
        await supabase.from('contents').update({ status: 'Analysé' }).eq('id', data.content_id);
      }
    }
    res.status(201).json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('analytics').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
