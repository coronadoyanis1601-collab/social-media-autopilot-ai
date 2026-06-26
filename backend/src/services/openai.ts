import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeContent(content: {
  title: string;
  media_type: string;
  original_text?: string;
  brand?: any;
}) {
  const brandContext = content.brand ? `
Marque: ${content.brand.brand_name}
Niche: ${content.brand.niche}
Audience cible: ${content.brand.target_audience}
Ton de voix: ${content.brand.tone_of_voice}
Sujets interdits: ${content.brand.forbidden_topics}
Langue: ${content.brand.content_language}
` : '';

  const prompt = `Tu es un expert en stratégie de contenu social media. Analyse ce contenu et retourne un JSON structuré.

CONTENU À ANALYSER:
- Titre: ${content.title}
- Type: ${content.media_type}
- Texte: ${content.original_text || 'Aucun texte fourni'}
${brandContext}

Retourne UNIQUEMENT ce JSON (sans markdown):
{
  "subject": "sujet principal du contenu",
  "target_audience": "audience cible probable",
  "emotion": "émotion principale transmise",
  "hook_quality": "évaluation du hook actuel (Excellent/Bon/Moyen/Faible)",
  "strengths": "points forts du contenu (liste)",
  "weaknesses": "points faibles du contenu (liste)",
  "flop_risks": "risques de mauvaises performances",
  "improvement_suggestions": "suggestions d'amélioration concrètes",
  "viral_score": 75,
  "viral_score_explanation": "explication détaillée du score",
  "score_breakdown": {
    "hook": 8,
    "clarity": 7,
    "emotion": 8,
    "originality": 6,
    "shareability": 7,
    "comment_potential": 8,
    "platform_fit": 7,
    "visual_quality": 7,
    "rhythm": 6,
    "cta": 7
  },
  "what_boosts_score": "ce qui augmente le potentiel viral",
  "what_limits_score": "ce qui limite la portée",
  "what_to_change": "modifications recommandées pour améliorer le score"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000
  });

  const text = response.choices[0].message.content || '{}';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return { error: 'Parsing error', raw: text };
  }
}

export async function generatePlatformContent(params: {
  content: any;
  platform: string;
  analysis: any;
  brand?: any;
}) {
  const { content, platform, analysis, brand } = params;

  const brandCtx = brand ? `Marque: ${brand.brand_name}, Ton: ${brand.tone_of_voice}, Langue: ${brand.content_language || 'Français'}` : '';

  const platformGuides: Record<string, string> = {
    Facebook: 'Caption 400-500 mots max, 2-5 hashtags, storytelling',
    Instagram: 'Caption Reel 150-300 mots, caption post 125-300 mots, 5-15 hashtags',
    TikTok: 'Caption 150 mots max, hook dans les 3 premières secondes, 3-5 hashtags ciblés',
    YouTube: 'Titre 60-70 chars SEO, description 200-300 mots, 10-15 tags',
    'X/Twitter': 'Post 280 chars max, thread 3-7 tweets, 1-2 hashtags',
    LinkedIn: 'Post 1300 chars max, ton professionnel, 3-5 hashtags pro',
    WhatsApp: 'Message 500 mots max, direct, conversationnel, opt-in obligatoire',
    Messenger: 'Court, conversationnel, max 3 questions qualification',
    Spotify: 'Titre épisode 60 chars, description 150-500 mots',
    Snapchat: 'Caption 50-80 chars, spontané, direct, ton jeune'
  };

  const prompt = `Tu es un expert copywriting viral. Génère du contenu optimisé pour ${platform}.

CONTENU SOURCE:
- Titre: ${content.title}
- Type: ${content.media_type}
- Texte original: ${content.original_text || ''}
- Analyse IA: Sujet=${analysis.subject}, Audience=${analysis.target_audience}, Émotion=${analysis.emotion}
- ${brandCtx}

GUIDE ${platform}: ${platformGuides[platform] || ''}

Retourne UNIQUEMENT ce JSON (sans markdown):
{
  "hook": "hook accrocheur pour ${platform}",
  "caption": "caption principale adaptée à ${platform}",
  "caption_short": "version courte de la caption",
  "caption_storytelling": "version storytelling engageante",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3",
  "call_to_action": "CTA clair et engageant",
  "title": "titre optimisé (pour YouTube/Spotify/TikTok)",
  "description": "description SEO (pour YouTube/Spotify)",
  "script": "script voix off ou texte parlé (pour vidéos/podcasts)",
  "on_screen_text": "texte à afficher à l'écran",
  "editing_recommendations": "recommandations de montage spécifiques",
  "cover_idea": "idée de visuel/miniature/cover",
  "music_suggestion": "suggestion musicale libre de droits",
  "recommended_format": "format recommandé (Reel/Carrousel/Post/Story/Thread...)",
  "recommended_duration": "durée recommandée",
  "pinned_comment": "commentaire à épingler",
  "thread_tweets": ["tweet 1", "tweet 2", "tweet 3"],
  "seo_tags": "tag1, tag2, tag3",
  "chapters": "00:00 Intro\n02:30 Point 1\n05:00 Conclusion",
  "is_compliant": true,
  "compliance_warnings": ""
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 3000
  });

  const text = response.choices[0].message.content || '{}';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return { error: 'Parsing error', raw: text };
  }
}

export async function generateImprovementReport(params: {
  content: any;
  analytics: any;
  predicted_score: number;
}) {
  const { content, analytics, predicted_score } = params;

  const prompt = `Tu es un analyste de performance social media. Génère un rapport d'amélioration.

DONNÉES:
- Contenu: ${content.title} (${content.media_type})
- Plateforme: ${analytics.platform}
- Score viral prédit: ${predicted_score}/100
- Score réel: ${analytics.actual_performance_score || 'N/A'}/100
- Vues: ${analytics.views}, Likes: ${analytics.likes}, Commentaires: ${analytics.comments}
- Partages: ${analytics.shares}, Sauvegardes: ${analytics.saves}
- Taux engagement: ${analytics.engagement_rate}%, Portée: ${analytics.reach}

Retourne UNIQUEMENT ce JSON (sans markdown):
{
  "what_worked": "ce qui a bien fonctionné",
  "what_failed": "ce qui n'a pas fonctionné",
  "why": "analyse des causes de performance",
  "next_recommendations": "recommandations pour le prochain contenu",
  "new_hooks_to_test": ["hook 1", "hook 2", "hook 3"],
  "new_formats_to_test": ["format 1", "format 2"],
  "platforms_to_prioritize": ["plateforme 1", "plateforme 2"],
  "topics_to_avoid": ["sujet à éviter 1"],
  "topics_to_repeat": ["sujet à répéter 1"],
  "new_ideas": [
    {"title": "idée 1", "description": "desc", "format": "Reel", "hook": "hook idea"},
    {"title": "idée 2", "description": "desc", "format": "Carrousel", "hook": "hook idea"}
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000
  });

  const text = response.choices[0].message.content || '{}';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return { error: 'Parsing error' };
  }
}

export default openai;
