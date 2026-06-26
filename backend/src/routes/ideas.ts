import { Router } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, priority, platform } = req.query;
    let query = supabase.from('ideas').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (platform) query = query.eq('platform', platform);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('ideas').insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('ideas').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('ideas').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
