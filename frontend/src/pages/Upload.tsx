import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentsAPI } from '../lib/api';
import { Upload as UploadIcon, Link, FileText, Image, Video, Music, Lightbulb, RefreshCw, Rocket } from 'lucide-react';

const PLATFORMS = ['Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat'];
const TYPES = [
  { id: 'photo', label: 'Photo', icon: Image },
  { id: 'video', label: 'Vidéo', icon: Video },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'text', label: 'Texte', icon: FileText },
  { id: 'idea', label: 'Idée', icon: Lightbulb },
  { id: 'link', label: 'Lien', icon: Link },
  { id: 'old_post', label: 'Ancien post', icon: RefreshCw },
];

export default function Upload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', media_type: 'text', original_text: '', media_url: '', target_platforms: [] as string[], status: 'Brouillon' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (p: string) => setForm(f => ({
    ...f,
    target_platforms: f.target_platforms.includes(p) ? f.target_platforms.filter(x => x !== p) : [...f.target_platforms, p]
  }));

  const submit = async () => {
    if (!form.title) return setError('Le titre est requis');
    if (!form.target_platforms.length) return setError('Sélectionnez au moins une plateforme');
    setLoading(true); setError('');
    try {
      const { data: content } = await contentsAPI.create(form);
      navigate(`/library/${content.id}`);
    } catch (e: any) { setError(e.response?.data?.error || 'Erreur lors de la création'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-2">Type de contenu</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {TYPES.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setForm(f => ({ ...f, media_type: id }))}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-xs font-medium
                ${form.media_type === id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Détails du contenu</h2>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Titre *</label>
          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Ex: Comment doubler ton engagement en 7 jours" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        {(form.media_type === 'text' || form.media_type === 'idea' || form.media_type === 'old_post') && (
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Contenu / Idée</label>
            <textarea rows={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder={form.media_type === 'idea' ? "Décris ton idée de contenu..." : "Écris ton texte ou colle ton ancien post..."}
              value={form.original_text} onChange={e => setForm(f => ({ ...f, original_text: e.target.value }))} />
          </div>
        )}
        {(form.media_type === 'link' || form.media_type === 'photo' || form.media_type === 'video' || form.media_type === 'audio') && (
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">URL du média</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="https://..." value={form.media_url} onChange={e => setForm(f => ({ ...f, media_url: e.target.value }))} />
          </div>
        )}
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-3">Plateformes cibles *</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => toggle(p)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                ${form.target_platforms.includes(p) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

      <button onClick={submit} disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold transition-all disabled:opacity-50">
        {loading ? <><span className="animate-spin">⏳</span>Création en cours...</> : <><Rocket size={20} />Créer et Analyser avec l'IA</>}
      </button>
    </div>
  );
}
