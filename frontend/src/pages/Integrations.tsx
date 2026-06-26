import React, { useEffect, useState } from 'react';
import { brandAPI } from '../lib/api';
import { Zap, Save, ExternalLink } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'n8n', name: 'n8n', desc: 'Automatisation no-code', url: 'https://n8n.io', category: 'Automation' },
  { id: 'make', name: 'Make (Integromat)', desc: 'Scénarios d\'automatisation', url: 'https://make.com', category: 'Automation' },
  { id: 'zapier', name: 'Zapier', desc: 'Connecter 5000+ apps', url: 'https://zapier.com', category: 'Automation' },
  { id: 'buffer', name: 'Buffer', desc: 'Programmer les publications', url: 'https://buffer.com', category: 'Publication' },
  { id: 'metricool', name: 'Metricool', desc: 'Analytics social media', url: 'https://metricool.com', category: 'Publication' },
  { id: 'meta', name: 'Meta Graph API', desc: 'Facebook & Instagram officiels', url: 'https://developers.facebook.com', category: 'Social API' },
  { id: 'tiktok', name: 'TikTok Content API', desc: 'Publication TikTok officielle', url: 'https://developers.tiktok.com', category: 'Social API' },
  { id: 'youtube', name: 'YouTube Data API', desc: 'YouTube officiel', url: 'https://developers.google.com/youtube', category: 'Social API' },
  { id: 'twitter', name: 'X (Twitter) API', desc: 'X officiel v2', url: 'https://developer.x.com', category: 'Social API' },
  { id: 'linkedin', name: 'LinkedIn API', desc: 'LinkedIn officiel', url: 'https://developer.linkedin.com', category: 'Social API' },
  { id: 'whatsapp', name: 'WhatsApp Cloud API', desc: 'Meta WhatsApp Business', url: 'https://developers.facebook.com/docs/whatsapp', category: 'Social API' },
  { id: 'spotify', name: 'Spotify API', desc: 'Spotify for Developers', url: 'https://developer.spotify.com', category: 'Social API' },
  { id: 'snapchat', name: 'Snapchat Creative Kit', desc: 'Snapchat officiel', url: 'https://kit.snapchat.com', category: 'Social API' },
];

const CATEGORIES = ['Automation', 'Publication', 'Social API'];

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Record<string,any>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    brandAPI.get().then(r => { if (r.data?.active_integrations) setIntegrations(r.data.active_integrations); });
  }, []);

  const toggle = (id: string) => setIntegrations(i => ({ ...i, [id]: { ...(i[id]||{}), enabled: !i[id]?.enabled } }));
  const setKey = (id: string, key: string, value: string) => setIntegrations(i => ({ ...i, [id]: { ...(i[id]||{}), [key]: value } }));

  const save = async () => {
    await brandAPI.save({ active_integrations: integrations });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4">
        <p className="text-sm text-indigo-300">
          <strong>Webhook URL Analytics :</strong> <code className="bg-black/30 px-2 py-0.5 rounded text-xs">{window.location.origin.replace('5173','3001')}/api/webhooks/analytics</code>
        </p>
        <p className="text-xs text-slate-400 mt-1">Utilisez cette URL dans n8n/Make/Zapier pour envoyer automatiquement les analytics après publication.</p>
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat} className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">{cat}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {INTEGRATIONS.filter(i => i.category === cat).map(integration => (
              <div key={integration.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm">{integration.name}</p>
                        <a href={integration.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <p className="text-xs text-slate-400">{integration.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => toggle(integration.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${integrations[integration.id]?.enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${integrations[integration.id]?.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                {integrations[integration.id]?.enabled && (
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder={`Clé API ${integration.name}...`}
                    value={integrations[integration.id]?.api_key || ''}
                    onChange={e => setKey(integration.id, 'api_key', e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={save} className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
        <Save size={18} />{saved ? '✅ Sauvegardé !' : 'Sauvegarder les intégrations'}
      </button>
    </div>
  );
}
