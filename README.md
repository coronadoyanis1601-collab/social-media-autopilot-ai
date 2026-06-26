# 🚀 Social Media Autopilot AI

Plateforme IA complète pour automatiser la création, l'optimisation et la publication de contenus sur 10 réseaux sociaux.

## Plateformes supportées
Facebook · Instagram · TikTok · YouTube · X/Twitter · LinkedIn · WhatsApp · Messenger · Spotify · Snapchat

## Stack technique
- **Backend** : Node.js + Express + TypeScript
- **Frontend** : React + Vite + TailwindCSS
- **Database** : Supabase (PostgreSQL)
- **IA** : OpenAI GPT-4o-mini
- **Déploiement** : Railway

## Démarrage rapide

### Variables d'environnement requises
```
SUPABASE_URL=https://nuxzxvbgngmayrbnkvxj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
PORT=3001
```

### Installation
```bash
# Backend
cd backend && npm install && npm run build && npm start

# Frontend
cd frontend && npm install && npm run dev
```

## Architecture
```
/backend   — API REST Express (analyse IA, génération contenu, analytics)
/frontend  — Interface React (dashboard, upload, calendrier, analytics)
/supabase  — Migrations SQL (5 tables)
```

## Webhook Analytics
POST `{API_URL}/api/webhooks/analytics` — pour envoyer les métriques depuis n8n/Make/Zapier après publication.
