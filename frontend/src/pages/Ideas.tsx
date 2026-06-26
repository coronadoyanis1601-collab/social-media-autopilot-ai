import React, { useEffect, useState } from 'react';
import { ideasAPI } from '../lib/api';
import { Plus, Lightbulb, Trash2 } from 'lucide-react';

const PLATFORMS = ['Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat','Toutes'];

export default function Ideas() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ idea_title: '', idea_description: '', platform: '', priority: 'Moyenne', source: 'Manuelle', hook_idea: '', content_format: '' });

  const load = () => ideasAPI.getAll().then(r => setIdeas(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.idea_title) return;
    await ideasAPI.create({ ...form, status: 'Nouvelle' });
    setShowForm(false);
    setForm({ idea_title: '', idea_description: '', platform: '', priority: 'Moyenne', source: 'Manuelle', hook_idea: '', content_format: '' });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await ideasAPI.update(id, { status });
    setIdeas(i => i.map(idea => idea.id === id ? { ...idea, status } : idea));
  };

  const priorityColor = (p: string) => ({ Haute: 'bg-red-500/20 text-red-400', Moyenne: 'bg-amber-500/20 text-amber-400', Basse: 'bg-slate-500/20 text-slate-400' }[p] || '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{ideas.length} idée(s) en stock</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} />Nouvelle idée
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-indigo-500/30 space-y-4">
          <h3 className="text-sm font-semibold text-white">Ajouter une idée</h3>
          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Titre de l'idée *" value={form.idea_title} onChange={e => setForm(f => ({ ...f, idea_title: e.target.value }))} />
          <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Description de l'idée..." value={form.idea_description} onChange={e => setForm(f => ({ ...f, idea_description: e.target.value }))} />
          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Idée de hook..." value={form.hook_idea} onChange={e => setForm(f => ({ ...f, hook_idea: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
              <option value="">Plateforme</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option>Haute</option><option>Moyenne</option><option>Basse</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">Sauvegarder</button>
            <button onClick={() => setShowForm(false)} className="bg-white/5 text-slate-400 px-4 py-2 rounded-xl text-sm transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-slate-400 text-center py-12">Chargement...</p> :
       ideas.length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-2xl p-12 border border-white/5 text-center">
          <Lightbulb size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">Aucune idée pour l'instant</p>
          <p className="text-xs text-slate-500 mt-1">L'IA génère des idées automatiquement après l'analyse de vos performances</p>
        </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map(idea => (
            <div key={idea.id} className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white text-sm flex-1">{idea.idea_title}</h3>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${priorityColor(idea.priority)}`}>{idea.priority}</span>
              </div>
              {idea.idea_description && <p className="text-xs text-slate-400 line-clamp-2">{idea.idea_description}</p>}
              {idea.hook_idea && <div className="bg-amber-500/10 rounded-lg p-2"><p className="text-xs text-amber-400">🎣 {idea.hook_idea}</p></div>}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <div className="flex gap-2">
                  {idea.platform && <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md">{idea.platform}</span>}
                  <span className="text-xs bg-white/5 text-slate-500 px-2 py-0.5 rounded-md">{idea.source}</span>
                </div>
                <select className="text-xs bg-transparent text-slate-400 border-none outline-none cursor-pointer"
                  value={idea.status} onChange={e => updateStatus(idea.id, e.target.value)}>
                  <option value="Nouvelle">Nouvelle</option>
                  <option value="En cours">En cours</option>
                  <option value="Utilisée">Utilisée</option>
                  <option value="Archivée">Archivée</option>
                </select>
              </div>
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
