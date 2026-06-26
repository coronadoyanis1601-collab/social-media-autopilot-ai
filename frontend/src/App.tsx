import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import ContentLibrary from './pages/ContentLibrary';
import ContentDetail from './pages/ContentDetail';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Ideas from './pages/Ideas';
import BrandSettings from './pages/BrandSettings';
import Integrations from './pages/Integrations';
import {
  LayoutDashboard, Upload as UploadIcon, Library, Calendar as CalIcon,
  BarChart2, Lightbulb, Settings, Zap, Menu, X, Rocket
} from 'lucide-react';

const nav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Uploader', icon: UploadIcon },
  { path: '/library', label: 'Bibliothèque', icon: Library },
  { path: '/calendar', label: 'Calendrier', icon: CalIcon },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/ideas', label: 'Idées', icon: Lightbulb },
  { path: '/brand', label: 'Ma Marque', icon: Settings },
  { path: '/integrations', label: 'Intégrations', icon: Zap },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const loc = useLocation();
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#13132a] border-r border-white/10 z-30 transform transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Autopilot AI</p>
              <p className="text-xs text-indigo-400">Social Media</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map(({ path, label, icon: Icon }) => {
            const active = loc.pathname === path;
            return (
              <Link key={path} to={path} onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-300 mb-1">🚀 10 Plateformes</p>
            <p className="text-xs text-slate-400">Facebook · Instagram · TikTok · YouTube · X · LinkedIn · WhatsApp · Messenger · Spotify · Snapchat</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loc = useLocation();
  const current = nav.find(n => n.path === loc.pathname);

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-[#0f0f1a]/90 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-white">{current?.label || 'Social Media Autopilot AI'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">IA Active</span>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/library" element={<ContentLibrary />} />
          <Route path="/library/:id" element={<ContentDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/brand" element={<BrandSettings />} />
          <Route path="/integrations" element={<Integrations />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
