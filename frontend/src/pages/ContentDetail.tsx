import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentsAPI, postsAPI, aiAPI } from '../lib/api';
import { Zap, RefreshCw, Check, Clock, Send, Archive, ChevronDown, ChevronUp, Copy } from 'lucide-react';

const PLATFORMS = ['Facebook','Instagram','TikTok','YouTube','X/Twitter','LinkedIn','WhatsApp','Messenger','Spotify','Snapchat'];
const PLATFORM_ICONS: Record<string,string> = { Facebook:'🔵',Instagram:'📸',TikTok:'🎵',YouTube:'▶️','X/Twitter':'🐦',LinkedIn:'💼',WhatsApp:'💬',Messenger:'📨',Spotify:'🎧',Snapchat:'👻' };

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [optimalTimes, setOptimalTimes] = useState<any>({});

  useEffect(() => {
    if (!id) return;
    contentsAPI.getOne(id).then(r => setContent(r.data));
    postsAPI.getAll({ content_id: id }).then(r => setPosts(r.data.data || []));
    aiAPI.getOptimalTimes().then(r => setOptimalTimes(r.data));
  }, [id]);

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const r = await contentsAPI.analyze(id!);
      setContent(r.data.content);
    } finally { setAnalyzing(false); }
  };

  const generate = async () => {
    if (!selectedPlatforms.length) return alert('Sélectionnez au moins une plateforme');
    setGenerating(true);
    try {
      const r = await postsAPI.generate(id!, selectedPlatforms);
      setPosts(p => [...p, ...(r.data.data || [])]);
      setSelectedPlatforms([]);
    } finally { setGenerating(false); }
  };

  const updateStatus = async (postId: string, status: string) => {
    await postsAPI.update(postId, { status });
    setPosts(p => p.map(post => post.id === postId ? { ...post, status } : post));
  };

  const regenerate = async (postId: string) => {
    const r = await postsAPI.regenerate(postId);
    setPosts(p => p.map(post => post.id === postId ? r.data : post));
  };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); };

  if (!content) return <div className="text-center py-20 text-slate-400">Chargement...</div>;

  const viralScore = content.viral_score ? Math.round(content.viral_score) : null;
  const scoreColor = viralScore ? (viralScore >= 70 ? 'text-emerald-400' : viralScore >= 50 ? 'text-amber-400' : 'text-red-400') : 'text-slate-400';
  const explanation = content.viral_score_explanation ? JSON.parse(content.viral_score_explanation) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-400 font-medium">{content.media_type}</span>
            <h2 className="text-xl font-bold text-white mt-2">{content.title}</h2>
          </div>
          {viralScore && <div className={`text-4xl font-bold ${scoreColor}`}>{viralScore}<span className="text-lg text-slate-500">/100</span></div>}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={analyze} disabled={analyzing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            {analyzing ? <><span className="animate-spin">⏳</span>Analyse IA...</> : <><Zap size={14} />{viralScore ? 'Ré-analyser' : 'Analyser avec l\'IA'}</>}
          </button>
          {content.status !== 'Publié' && (
            <button onClick={() => contentsAPI.update(id!, { status: 'Archivé' }).then(() => navigate('/library'))}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 px-4 py-2 rounded-xl text-sm transition-colors">
              <Archive size={14} />Archiver
            </button>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {content.subject && (
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4">🔍 Analyse IA</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[['Sujet',content.subject],['Audience',content.target_audience],['Émotion',content.emotion],['Qualité Hook',content.hook_quality]].map(([k,v]) => (
              <div key={k} className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="text-sm font-medium text-white">{v || '—'}</p>
              </div>
            ))}
          </div>
          {explanation && (
            <div className="space-y-3">
              {explanation.breakdown && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">Score par critère</p>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(explanation.breakdown).map(([k, v]: any) => (
                      <div key={k} className="text-center">
                        <div className="text-lg font-bold text-white">{v}</div>
                        <div className="text-xs text-slate-500 capitalize">{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-3">
                {content.strengths && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"><p className="text-xs font-semibold text-emerald-400 mb-1">✅ Points forts</p><p className="text-xs text-slate-300">{content.strengths}</p></div>}
                {content.weaknesses && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-xs font-semibold text-red-400 mb-1">⚠️ Points faibles</p><p className="text-xs text-slate-300">{content.weaknesses}</p></div>}
                {content.improvement_suggestions && <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 md:col-span-2"><p className="text-xs font-semibold text-blue-400 mb-1">💡 Suggestions</p><p className="text-xs text-slate-300">{content.improvement_suggestions}</p></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate posts */}
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-3">🚀 Générer les posts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setSelectedPlatforms(s => s.includes(p) ? s.filter(x=>x!==p) : [...s,p])}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedPlatforms.includes(p) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
              {PLATFORM_ICONS[p]} {p}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={generating || !selectedPlatforms.length}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
          {generating ? <><span className="animate-spin">⏳</span>Génération...</> : <><Zap size={16} />Générer {selectedPlatforms.length > 0 ? `pour ${selectedPlatforms.length} plateforme(s)` : 'les posts'}</>}
        </button>
      </div>

      {/* Generated posts */}
      {posts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">📝 Posts générés ({posts.length})</h3>
          {posts.map(post => (
            <div key={post.id} className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{PLATFORM_ICONS[post.platform]}</span>
                  <div>
                    <p className="font-semibold text-white">{post.platform}</p>
                    <p className="text-xs text-slate-400">{post.recommended_format}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!post.is_compliant && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">⚠️ Non conforme</span>}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.status === 'Validé' ? 'bg-blue-500/20 text-blue-400' :
                    post.status === 'Programmé' ? 'bg-purple-500/20 text-purple-400' :
                    post.status === 'Publié' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>{post.status}</span>
                  <button onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="text-slate-400 hover:text-white transition-colors">
                    {expandedPost === post.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              {expandedPost === post.id && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                  {post.hook && <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"><p className="text-xs font-semibold text-amber-400 mb-1">🎣 Hook</p><p className="text-sm text-white">{post.hook}</p></div>}
                  {post.caption && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs font-semibold text-slate-400 mb-1">📝 Caption</p><p className="text-sm text-slate-300 whitespace-pre-line">{post.caption}</p><button onClick={() => copyText(post.caption)} className="mt-2 text-xs text-indigo-400 flex items-center gap-1"><Copy size={10}/>Copier</button></div>}
                  {post.hashtags && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs font-semibold text-slate-400 mb-1">#️⃣ Hashtags</p><p className="text-sm text-indigo-300">{post.hashtags}</p></div>}
                  {post.call_to_action && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs font-semibold text-slate-400 mb-1">🎯 CTA</p><p className="text-sm text-white">{post.call_to_action}</p></div>}
                  {post.music_suggestion && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs font-semibold text-slate-400 mb-1">🎵 Musique (libre de droits)</p><p className="text-sm text-white">{post.music_suggestion}</p></div>}
                  {post.editing_recommendations && <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3"><p className="text-xs font-semibold text-purple-400 mb-1">✂️ Montage</p><p className="text-sm text-slate-300 whitespace-pre-line">{post.editing_recommendations}</p></div>}
                  {post.compliance_warnings && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-xs font-semibold text-red-400 mb-1">⚠️ Avertissements conformité</p><p className="text-sm text-slate-300">{post.compliance_warnings}</p></div>}

                  {/* Optimal times for this platform */}
                  {optimalTimes[post.platform] && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-400 mb-2">⏰ Meilleurs horaires — {post.platform}</p>
                      <p className="text-xs text-slate-300">{optimalTimes[post.platform].days?.join(', ')} · {optimalTimes[post.platform].hours?.join(', ')}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.status !== 'Validé' && post.status !== 'Publié' && (
                      <button onClick={() => updateStatus(post.id, 'Validé')} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                        <Check size={12} />Valider
                      </button>
                    )}
                    {post.status === 'Validé' && (
                      <button onClick={() => updateStatus(post.id, 'Programmé')} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                        <Clock size={12} />Programmer
                      </button>
                    )}
                    {post.status === 'Programmé' && (
                      <button onClick={() => updateStatus(post.id, 'Publié')} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                        <Send size={12} />Publier
                      </button>
                    )}
                    <button onClick={() => regenerate(post.id)} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                      <RefreshCw size={12} />Régénérer
                    </button>
                    <button onClick={() => updateStatus(post.id, 'Archivé')} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                      <Archive size={12} />Archiver
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
