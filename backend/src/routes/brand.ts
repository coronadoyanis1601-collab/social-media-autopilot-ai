import { Router } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

router.get('/', async (_, res) => {
  try {
    const { data } = await supabase.from('brand_settings').select('*').limit(1).single();
    res.json(data || {});
  } catch { res.json({}); }
});

router.post('/', async (req, res) => {
  try {
    const { data: existing } = await supabase.from('brand_settings').select('id').limit(1).single();
    let result;
    if (existing?.id) {
      const { data } = await supabase.from('brand_settings').update(req.body).eq('id', existing.id).select().single();
      result = data;
    } else {
      const { data } = await supabase.from('brand_settings').insert([req.body]).select().single();
      result = data;
    }
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
