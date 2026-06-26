import React, { useEffect, useState } from 'react';
import { postsAPI } from '../lib/api';
import { Calendar as CalIcon, Clock } from 'lucide-react';

const PLATFORM_ICONS: Record<string,string> = { Facebook:'🔵',Instagram:'📸',TikTok:'🎵',YouTube:'▶️','X/Twitter':'🐦',LinkedIn:'💼',WhatsApp:'💬',Messenger:'📨',Spotify:'🎧',Snapchat:'👻' };

export default function Calendar() {
  const [posts, setPosts] = useState<any[]>([]);
  const [view, setView] = useState<'scheduled'|'all'>('scheduled');

  useEffect(() => {
    postsAPI.getAll(view === 'scheduled' ? { status: 'Programmé' } : undefined).then(r => setPosts(r.data.data || []));
  }, [view]);

  const grouped = posts.reduce((acc: any, p) => {
    const date = p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString('fr-FR') : 'Non programmé';
    if (!acc[date]) acc[date] = [];
    acc[date].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[['scheduled','Programmés'],['all','Tous']].map(([v,l]) => (
          <button key={v} onClick={() => setView(v as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view===v ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] border border-white/10 text-slate-400 hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-2xl p-12 border border-white/5 text-center">
          <CalIcon size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">Aucun contenu programmé</p>
          <p className="text-xs text-slate-500 mt-1">Validez et programmez vos posts depuis la bibliothèque</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, datePosts]: any) => (
          <div key={date} className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <CalIcon size={16} className="text-indigo-400" />
              <h3 className="font-semibold text-white">{date}</h3>
              <span className="text-xs text-slate-500">{datePosts.length} post(s)</span>
            </div>
            <div className="divide-y divide-white/5">
              {datePosts.map((p: any) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{PLATFORM_ICONS[p.platform]}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{p.platform}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{p.hook || p.caption?.slice(0, 60) || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.scheduled_at && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {new Date(p.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'Programmé' ? 'bg-purple-500/20 text-purple-400' : p.status === 'Publié' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
