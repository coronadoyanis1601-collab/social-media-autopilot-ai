import React, { useEffect, useState } from 'react';
import { brandAPI } from '../lib/api';
import { Save, Settings } from 'lucide-react';

const PLATFORMS = ['Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat'];

export default function BrandSettings() {
  const [form, setForm] = useState<any>({ brand_name:'',niche:'',target_audience:'',tone_of_voice:'Professionnel',content_language:'Français',forbidden_topics:'',main_offer:'',competitors:'',keywords:'',preferred_platforms:[],brand_values:'',content_pillars:'',posting_frequency:'' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { brandAPI.get().then(r => { if (r.data?.brand_name) setForm((f:any) => ({ ...f, ...r.data })); }); }, []);

  const save = async () => {
    await brandAPI.save(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (p: string) => setForm((f:any) => ({ ...f, preferred_platforms: f.preferred_platforms?.includes(p) ? f.preferred_platforms.filter((x:string)=>x!==p) : [...(f.preferred_platforms||[]),p] }));

  const F = ({ label, field, placeholder, type='text' }: any) => (
    <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          placeholder={placeholder} value={form[field]||''} onChange={e => setForm((f:any)=>({...f,[field]:e.target.value}))} />
      ) : (
        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder={placeholder} value={form[field]||''} onChange={e => setForm((f:any)=>({...f,[field]:e.target.value}))} />
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center gap-2 mb-2"><Settings size={16} className="text-indigo-400" /><h3 className="text-sm font-semibold text-white">Identité de marque</h3></div>
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Nom de la marque" field="brand_name" placeholder="Ex: JY-Trix.AI" />
          <F label="Niche / Secteur" field="niche" placeholder="Ex: Marketing digital, Fitness..." />
          <F label="Offre principale" field="main_offer" placeholder="Ex: Formation, SaaS, E-commerce..." />
          <F label="Langue du contenu" field="content_language" placeholder="Français" />
        </div>
        <F label="Audience cible" field="target_audience" placeholder="Ex: Entrepreneurs 25-45 ans, PME belges..." />
        <F label="Valeurs de marque" field="brand_values" placeholder="Ex: Innovation, Transparence, Excellence" />
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Style de communication</h3>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Ton de voix</label>
          <div className="grid grid-cols-4 gap-2">
            {['Décontracté','Professionnel','Inspirant','Humoristique','Éducatif','Autoritaire','Empathique','Authentique'].map(t => (
              <button key={t} onClick={() => setForm((f:any)=>({...f,tone_of_voice:t}))}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${form.tone_of_voice===t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>{t}</button>
            ))}
          </div>
        </div>
        <F label="Piliers de contenu" field="content_pillars" placeholder="Ex: Éducatif, Inspirant, Promotionnel, Divertissement" type="textarea" />
        <F label="Fréquence de publication" field="posting_frequency" placeholder="Ex: 1x/jour sur Instagram, 3x/semaine sur LinkedIn" />
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Stratégie</h3>
        <F label="Mots-clés importants" field="keywords" placeholder="Ex: automation, IA, marketing, croissance..." />
        <F label="Concurrents" field="competitors" placeholder="Ex: Buffer, Hootsuite, Later..." />
        <F label="Sujets interdits" field="forbidden_topics" placeholder="Ex: Politique, Religion, Alcool..." type="textarea" />
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-3">Plateformes préférées</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => toggle(p)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.preferred_platforms?.includes(p) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>{p}</button>
          ))}
        </div>
      </div>

      <button onClick={save} className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
        <Save size={18} />{saved ? '✅ Sauvegardé !' : 'Sauvegarder les paramètres'}
      </button>
    </div>
  );
}
