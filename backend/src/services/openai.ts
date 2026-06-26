import OpenAI from 'openai';

// Lazy initialization - don't crash if key missing at startup
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

const PLATFORMS = ['facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'linkedin', 'whatsapp', 'messenger', 'spotify', 'snapchat'] as const;

export async function analyzeContent(content: {
  title: string;
  media_type: string;
  original_text?: string;
  target_platforms?: string[];
}): Promise<any> {
  const client = getClient();
  const prompt = `Tu es un expert en stratégie de contenu social media. Analyse ce contenu et retourne un JSON structuré.

Contenu:
- Titre: ${content.title}
- Type: ${content.media_type}
- Texte: ${content.original_text || 'Non fourni'}
- Plateformes cibles: ${(content.target_platforms || []).join(', ')}

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
  "subject": "sujet principal du contenu",
  "target_audience": "audience cible probable",
  "emotion": "émotion principale transmise",
  "hook_quality": "évaluation du hook sur 10",
  "strengths": ["force 1", "force 2", "force 3"],
  "weaknesses": ["faiblesse 1", "faiblesse 2"],
  "flop_risks": ["risque 1", "risque 2"],
  "improvement_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "viral_score": 75,
  "viral_score_explanation": "explication détaillée du score",
  "ai_analysis": "analyse complète en 3-4 phrases"
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generatePlatformContent(
  platform: string,
  content: {
    title: string;
    original_text?: string;
    subject?: string;
    target_audience?: string;
    emotion?: string;
  }
): Promise<any> {
  const client = getClient();
  const platformGuides: Record<string, string> = {
    facebook: 'Caption engageante (400-500 mots max), version courte, version storytelling, 2-5 hashtags, call-to-action, idée de commentaire épinglé',
    instagram: 'Caption Reel (150-300 mots), caption post, caption story (50-100 mots), 5-15 hashtags, texte à l\'écran, idée de cover, format recommandé (Reel/carrousel/post/story)',
    tiktok: 'Hook de départ percutant, caption courte (150 mots max), 3-5 hashtags ciblés, script voix off, texte à afficher, idée de montage, suggestion musicale, durée recommandée',
    youtube: 'Titre Short (60-70 chars), titre vidéo longue, description SEO (200-300 mots), 10-15 tags, chapitres si applicable, idée miniature, commentaire épinglé',
    twitter: 'Post court (280 chars), version punchline, thread de 3-7 tweets, 1-2 hashtags max, angle polémique/conversationnel',
    linkedin: 'Post professionnel, version storytelling, version éducative, hook B2B, 3-5 hashtags professionnels, format suggéré (texte/image/carrousel/vidéo)',
    whatsapp: 'Message court audience (500 mots max), version promo, version informative, séquence relance (2 max), message de suivi',
    messenger: 'Réponse automatique, message qualification prospect, message relance, message support client',
    spotify: 'Titre épisode podcast (60 chars max), description épisode (150-500 mots), résumé, notes d\'épisode, phrases promo pour autres réseaux',
    snapchat: 'Caption courte (50-80 chars), idée Spotlight, texte à afficher, sticker recommandé, version spontanée, idée story',
  };

  const guide = platformGuides[platform] || 'Génère un contenu adapté à la plateforme';

  const prompt = `Tu es un expert en content marketing. Génère du contenu optimisé pour ${platform.toUpperCase()}.

Contenu source:
- Titre: ${content.title}
- Texte: ${content.original_text || 'Non fourni'}
- Sujet: ${content.subject || 'Non défini'}
- Audience: ${content.target_audience || 'Non définie'}
- Émotion: ${content.emotion || 'Non définie'}

Consignes pour ${platform}: ${guide}

Retourne UNIQUEMENT un JSON valide avec:
{
  "caption": "caption principale",
  "caption_short": "version courte",
  "caption_storytelling": "version storytelling",
  "hashtags": ["hashtag1", "hashtag2"],
  "hook": "hook d'accroche",
  "call_to_action": "CTA",
  "title": "titre si applicable",
  "description": "description si applicable",
  "script": "script voix off si applicable",
  "on_screen_text": "texte à l'écran",
  "editing_recommendations": "recommandations de montage",
  "cover_idea": "idée de cover/miniature",
  "music_suggestion": "suggestion musicale",
  "recommended_format": "format recommandé",
  "recommended_duration": "durée recommandée",
  "pinned_comment": "commentaire épinglé si applicable",
  "thread_tweets": ["tweet1", "tweet2", "tweet3"],
  "seo_tags": ["tag1", "tag2"],
  "chapters": "chapitres si applicable"
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generateImprovementReport(analytics: {
  platform: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  engagement_rate?: number;
  retention_rate?: number;
  predicted_score?: number;
}): Promise<string> {
  const client = getClient();
  const prompt = `Tu es un analyste de performance social media. Génère un rapport d'amélioration basé sur ces analytics.

Analytics:
- Plateforme: ${analytics.platform}
- Vues: ${analytics.views || 0}
- Likes: ${analytics.likes || 0}
- Commentaires: ${analytics.comments || 0}
- Partages: ${analytics.shares || 0}
- Taux d'engagement: ${analytics.engagement_rate || 0}%
- Taux de rétention: ${analytics.retention_rate || 0}%
- Score viral prédit: ${analytics.predicted_score || 0}/100

Génère un rapport structuré en français avec:
1. Ce qui a marché
2. Ce qui n'a pas marché
3. Pourquoi
4. Recommandations pour le prochain contenu
5. Nouveaux hooks à tester
6. Formats à tester
7. Plateformes à privilégier
8. Sujets à éviter/répéter`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
}

export { PLATFORMS };
