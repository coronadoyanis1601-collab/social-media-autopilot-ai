import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentsAPI } from '../lib/api';
import { Search, Filter, Zap } from 'lucide-react';

const STATUSES = ['Tous','Brouillon','À améliorer','À valider','Validé','Programmé','Publié','Analysé'];

export default function ContentLibrary() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');

  useEffect(() => {
    contentsAPI.getAll().then(r => setContents(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = contents.filter(c => {
    const matchStatus = filter === 'Tous' || c.status === filter;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusColor = (s: string) => ({
    'Brouillon':'bg-slate-500/20 text-slate-400','À améliorer':'bg-orange-500/20 text-orange-400',
    'À valider':'bg-yellow-500/20 text-yellow-400','Validé':'bg-blue-500/20 text-blue-400',
    'Programmé':'bg-purple-500/20 text-purple-400','Publié':'bg-emerald-500/20 text-emerald-400',
    'Analysé':'bg-pink-500/20 text-pink-400'
  }[s] || 'bg-slate-500/20 text-slate-400');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Rechercher un contenu..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] border border-white/10 text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-slate-500 text-center py-12">Chargement...</p> :
       filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400">Aucun contenu trouvé</p>
          <Link to="/upload" className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Zap size={14} />Créer un contenu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Link key={c.id} to={`/library/${c.id}`} className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5 hover:border-indigo-500/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 font-medium">{c.media_type}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">{c.title}</h3>
              {c.target_platforms?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.target_platforms.slice(0, 4).map((p: string) => (
                    <span key={p} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">{p}</span>
                  ))}
                  {c.target_platforms.length > 4 && <span className="text-xs text-slate-500">+{c.target_platforms.length - 4}</span>}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                {c.viral_score && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${c.viral_score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-amber-400">{Math.round(c.viral_score)}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
