import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentsAPI } from '../lib/api';
import { TrendingUp, Clock, CheckCircle, Rocket, Star, BarChart2, Zap, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([contentsAPI.getDashboard(), contentsAPI.getAll()]).then(([s, c]) => {
      setStats(s.data);
      setContents(c.data.data?.slice(0, 5) || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Contenus', value: stats?.total || 0, icon: BarChart2, color: 'from-indigo-500 to-indigo-700', sub: `${stats?.weekly_contents || 0} cette semaine` },
    { label: 'En attente', value: (stats?.by_status?.['À valider'] || 0) + (stats?.by_status?.['À améliorer'] || 0), icon: Clock, color: 'from-amber-500 to-orange-600', sub: 'À valider ou améliorer' },
    { label: 'Programmés', value: stats?.by_status?.['Programmé'] || 0, icon: Rocket, color: 'from-emerald-500 to-teal-600', sub: 'Prêts à publier' },
    { label: 'Publiés', value: stats?.by_status?.['Publié'] || 0, icon: CheckCircle, color: 'from-purple-500 to-pink-600', sub: `${stats?.by_status?.['Analysé'] || 0} analysés` },
  ];

  const platforms = ['Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat'];
  const platformColors: Record<string, string> = {
    Facebook:'bg-blue-600', Instagram:'bg-gradient-to-r from-purple-500 to-pink-500', TikTok:'bg-black border border-white/20',
    YouTube:'bg-red-600', 'X/Twitter':'bg-slate-800', LinkedIn:'bg-blue-700', WhatsApp:'bg-emerald-600',
    Messenger:'bg-gradient-to-r from-blue-400 to-purple-500', Spotify:'bg-green-600', Snapchat:'bg-yellow-400'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bienvenue 👋</h2>
          <p className="text-slate-400 mt-1">Votre assistant IA pour dominer les réseaux sociaux</p>
        </div>
        <Link to="/upload" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Rocket size={16} />Nouveau contenu
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{loading ? '—' : value}</p>
            <p className="text-sm font-medium text-slate-300 mt-1">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Score + Top Platform */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Score Viral Moyen</h3>
          </div>
          <div className="text-5xl font-bold text-white mb-2">{stats?.avg_viral_score || 0}<span className="text-2xl text-slate-500">/100</span></div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all" style={{ width: `${stats?.avg_viral_score || 0}%` }} />
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Top Plateforme</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.top_platform || '—'}</p>
          <p className="text-xs text-slate-400 mt-2">Meilleur taux d'engagement</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Statuts</h3>
          </div>
          <div className="space-y-2">
            {['Brouillon','À valider','Validé','Programmé','Publié'].map(s => (
              <div key={s} className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{s}</span>
                <span className="text-white font-semibold">{stats?.by_status?.[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platforms grid */}
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-4">Plateformes Supportées</h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => (
            <span key={p} className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${platformColors[p]}`}>{p}</span>
          ))}
        </div>
      </div>

      {/* Recent contents */}
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Contenus Récents</h3>
          <Link to="/library" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Voir tout <ArrowRight size={12} /></Link>
        </div>
        {loading ? <p className="text-slate-500 text-sm">Chargement...</p> : contents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">Aucun contenu pour l'instant</p>
            <Link to="/upload" className="mt-3 inline-flex items-center gap-2 text-indigo-400 text-sm hover:text-indigo-300">
              <Rocket size={14} />Uploader votre premier contenu
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contents.map(c => (
              <Link key={c.id} to={`/library/${c.id}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-xs">{c.media_type?.[0]?.toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.target_platforms?.join(', ') || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.viral_score && <span className="text-xs font-bold text-amber-400">{Math.round(c.viral_score)}/100</span>}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    c.status === 'Publié' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.status === 'Validé' ? 'bg-blue-500/20 text-blue-400' :
                    c.status === 'Programmé' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>{c.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
