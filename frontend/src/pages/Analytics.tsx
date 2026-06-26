import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAll().then(r => setAnalytics(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const byPlatform = analytics.reduce((acc: any, a) => {
    if (!acc[a.platform]) acc[a.platform] = { platform: a.platform, views: 0, likes: 0, comments: 0, shares: 0, engagement: 0, count: 0 };
    acc[a.platform].views += a.views;
    acc[a.platform].likes += a.likes;
    acc[a.platform].comments += a.comments;
    acc[a.platform].shares += a.shares;
    acc[a.platform].engagement += a.engagement_rate;
    acc[a.platform].count++;
    return acc;
  }, {});
  const chartData = Object.values(byPlatform).map((p: any) => ({ ...p, avg_engagement: p.count ? +(p.engagement/p.count).toFixed(2) : 0 }));

  return (
    <div className="space-y-6">
      {loading ? <p className="text-slate-400 text-center py-12">Chargement...</p> :
       analytics.length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-2xl p-12 border border-white/5 text-center">
          <p className="text-slate-400">Aucune donnée analytics</p>
          <p className="text-xs text-slate-500 mt-1">Les analytics apparaissent après publication et collecte via webhook</p>
        </div>
       ) : (
        <>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Vues par plateforme</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="platform" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Bar dataKey="views" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.slice(0, 10).map(a => (
              <div key={a.id} className="bg-[#1a1a2e] rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between mb-3">
                  <span className="font-semibold text-white">{a.platform}</span>
                  <span className="text-xs text-slate-400">{a.collected_at ? new Date(a.collected_at).toLocaleDateString('fr-FR') : '—'}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[['Views',a.views],['Likes',a.likes],['Comments',a.comments],['Shares',a.shares]].map(([l,v]) => (
                    <div key={l}><p className="text-lg font-bold text-white">{(v||0).toLocaleString()}</p><p className="text-xs text-slate-500">{l}</p></div>
                  ))}
                </div>
                {a.improvement_report && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs font-semibold text-indigo-400 mb-1">📊 Rapport IA</p>
                    <p className="text-xs text-slate-400 line-clamp-3">{JSON.parse(a.improvement_report)?.why || ''}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
       )}
    </div>
  );
}
