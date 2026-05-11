/**
 * Yomu AI — Manga Scraper Utility
 * Supports JSON APIs (MangaDex, etc.) and HTML page scraping.
 * Uses a CORS proxy on web; direct fetch on native.
 * Never throws — all errors are returned as { error } objects.
 */

import { Platform } from 'react-native';

const FETCH_TIMEOUT_MS = 12000;
const UA =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// ─── URL Helpers ─────────────────────────────────────────────────────────────

/**
 * Validate and normalise a raw string into a full URL.
 * Returns { url, error }.
 */
export function sanitizeUrl(raw) {
  if (!raw || typeof raw !== 'string') {
    return { url: null, error: 'Veuillez entrer une URL valide.' };
  }

  let trimmed = raw.trim();

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { url: null, error: 'Le nom de domaine est invalide.' };
    }
    return { url: parsed.href, error: null };
  } catch {
    return { url: null, error: "L'URL saisie n'est pas reconnue. Vérifiez le format." };
  }
}

/**
 * Detect known manga platforms from URL and return a platform key.
 */
function detectPlatform(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    if (host.includes('mangadex.org')) return 'mangadex';
    if (host.includes('myanimelist.net')) return 'mal';
    if (host.includes('mangakakalot') || host.includes('manganelo') || host.includes('mangabat')) return 'kakalot';
    if (host.includes('webtoon') || host.includes('webtoons')) return 'webtoon';
    return 'generic';
  } catch {
    return 'generic';
  }
}

// ─── Fetch with timeout + optional CORS proxy ─────────────────────────────────

async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const targetUrl =
    Platform.OS === 'web' ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;

  try {
    const response = await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'application/json, text/html, */*',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timer);
    return { response, error: null };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { response: null, error: 'La connexion a expiré. Vérifiez votre réseau.' };
    }
    return { response: null, error: 'Impossible de contacter le site. Vérifiez l\'URL et votre connexion.' };
  }
}

async function fetchText(url) {
  const { response, error } = await timedFetch(url);
  if (error) return { text: null, json: null, isHtml: false, error };

  if (!response.ok) {
    return {
      text: null, json: null, isHtml: false,
      error: `Le serveur a répondu avec une erreur (code ${response.status}).`,
    };
  }

  try {
    const text = await response.text();
    const trimmed = text.trimStart();
    const isHtml =
      trimmed.startsWith('<!') ||
      trimmed.startsWith('<html') ||
      trimmed.startsWith('<HTML') ||
      (trimmed.startsWith('<') && !trimmed.startsWith('<?xml'));

    let json = null;
    if (!isHtml) {
      try { json = JSON.parse(text); } catch { /* not JSON */ }
    }

    return { text, json, isHtml, error: null };
  } catch {
    return { text: null, json: null, isHtml: false, error: 'Impossible de lire la réponse du serveur.' };
  }
}

// ─── HTML Parsers ─────────────────────────────────────────────────────────────

function firstMatch(html, patterns) {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
  }
  return null;
}

function parseTitle(html) {
  return firstMatch(html, [
    /property="og:title"\s+content="([^"]+)"/i,
    /name="title"\s+content="([^"]+)"/i,
    /<h1[^>]*class="[^"]*(?:title|name|manga-title)[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([\s\S]*?)<\/title>/i,
  ]);
}

function parseCover(html, baseUrl) {
  const raw = firstMatch(html, [
    /property="og:image"\s+content="([^"]+)"/i,
    /property="og:image:url"\s+content="([^"]+)"/i,
    /<img[^>]*class="[^"]*(?:cover|thumbnail|poster|manga-cover)[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*src="([^"]+)"[^>]*class="[^"]*(?:cover|thumbnail|poster)[^"]*"/i,
    /<img[^>]*class="[^"]*(?:lazy)[^"]*"[^>]*data-src="([^"]+)"/i,
    /<img[^>]*data-src="([^"]+)"[^>]*class="[^"]*(?:cover|lazy)[^"]*"/i,
  ]);
  if (!raw) return null;
  return resolveUrl(raw, baseUrl);
}

function parseRating(html) {
  const raw = firstMatch(html, [
    /itemprop="ratingValue"\s+content="([^"]+)"/i,
    /class="[^"]*(?:score|rating|rate)[^"]*"[^>]*>([\d.]+)/i,
    /"ratingValue"\s*:\s*"?([\d.]+)"?/i,
  ]);
  if (!raw) return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : Math.round(n * 10) / 10;
}

function parseDescription(html) {
  return firstMatch(html, [
    /property="og:description"\s+content="([^"]{20,})"/i,
    /name="description"\s+content="([^"]{20,})"/i,
    /<div[^>]*class="[^"]*(?:synopsis|description|summary|story|about)[^"]*"[^>]*>([\s\S]{20,?}?)<\/div>/i,
    /<p[^>]*class="[^"]*(?:synopsis|description|summary)[^"]*"[^>]*>([\s\S]{20,?}?)<\/p>/i,
    /<p>([\s\S]{60,?}?)<\/p>/i,
  ]);
}

function parseAltTitles(html) {
  const alts = [];

  const altPatterns = [
    /(?:alternative|alt(?:ernative)?[\s_-]*titles?|autres?\s+titres?|عناوين\s+بديلة)[^:]*:\s*<\/[^>]+>\s*([\s\S]{2,200}?)<\/(div|li|p|span|td)/i,
    /class="[^"]*(?:alt-title|alternative-title|other-name)[^"]*"[^>]*>([\s\S]{2,200}?)<\//i,
  ];

  for (const re of altPatterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const raw = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (raw.length > 1) {
        raw.split(/[;,|·•\/]/).forEach((t) => {
          const clean = t.trim();
          if (clean.length > 0) alts.push(clean);
        });
      }
    }
  }

  return [...new Set(alts)].slice(0, 6);
}

function parseGenre(html) {
  const raw = firstMatch(html, [
    /property="og:genre"\s+content="([^"]+)"/i,
    /itemprop="genre"[^>]*>\s*([^<]{2,50})\s*</i,
    /class="[^"]*(?:genre|category|tag)[^"]*"[^>]*>\s*([^<]{2,50})\s*</i,
  ]);
  if (raw) return raw;

  const tagPattern = /<a[^>]*(?:genre|tag|category)[^>]*>\s*([^<]{2,30})\s*<\/a>/gi;
  const tags = [];
  let m;
  while ((m = tagPattern.exec(html)) !== null && tags.length < 3) {
    tags.push(m[1].trim());
  }
  return tags.length ? tags.join(' • ') : null;
}

function parseStatus(html) {
  const raw = firstMatch(html, [
    /class="[^"]*(?:status)[^"]*"[^>]*>\s*([^<]{2,30})\s*</i,
    /(?:statut|status|état|publication)[^:]*:\s*<\/[^>]+>\s*([^<]{2,30})</i,
  ]);
  if (!raw) return 'En cours';
  const lower = raw.toLowerCase();
  if (lower.includes('complet') || lower.includes('terminé') || lower.includes('finished') || lower.includes('completed')) return 'Terminé';
  if (lower.includes('hiatus') || lower.includes('pause')) return 'En pause';
  return 'En cours';
}

function parseChapters(html, baseUrl) {
  const chapters = [];
  const seen = new Set();

  const chapterRe =
    /<a[^>]*href="([^"]*(?:chapter|ch(?:ap)?[-_]?\d|chapitre|capitulo|vol)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;

  let m;
  while ((m = chapterRe.exec(html)) !== null && chapters.length < 150) {
    let url = m[1];
    const rawTitle = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!rawTitle || rawTitle.length > 120) continue;

    url = resolveUrl(url, baseUrl);
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const numMatch = rawTitle.match(/(\d+(?:[.,]\d+)?)/);
    const number = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : chapters.length + 1;

    chapters.push({ id: `ch_${number}`, number, title: rawTitle, url, date: '', pages: 0 });
  }

  return chapters.sort((a, b) => b.number - a.number);
}

function resolveUrl(href, baseUrl) {
  if (!href) return null;
  href = href.trim();
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  try {
    const base = new URL(baseUrl);
    if (href.startsWith('//')) return base.protocol + href;
    if (href.startsWith('/')) return base.origin + href;
    return base.origin + '/' + href;
  } catch {
    return null;
  }
}

// ─── Platform-specific parsers ────────────────────────────────────────────────

async function parseMangaDex(url) {
  const idMatch = url.match(/mangadex\.org\/title\/([a-f0-9-]{36})/i);
  if (!idMatch) return { error: 'URL MangaDex invalide. Elle doit contenir un ID de manga.' };

  const apiId = idMatch[1];
  const apiUrl = `https://api.mangadex.org/manga/${apiId}?includes[]=cover_art&includes[]=author&includes[]=artist`;
  const { text, json, error } = await fetchText(apiUrl);
  if (error) return { error };

  const data = json?.data;
  if (!data) return { error: 'Aucune donnée MangaDex trouvée pour cet ID.' };

  const attrs = data.attributes || {};
  const title =
    attrs.title?.fr || attrs.title?.en || Object.values(attrs.title || {})[0] || 'Sans titre';
  const description =
    attrs.description?.fr || attrs.description?.en || Object.values(attrs.description || {})[0] || '';

  const altTitles = (attrs.altTitles || [])
    .flatMap((a) => Object.values(a))
    .filter(Boolean)
    .slice(0, 6);

  const tags = (attrs.tags || [])
    .map((t) => t.attributes?.name?.fr || t.attributes?.name?.en)
    .filter(Boolean)
    .slice(0, 3);

  let cover = null;
  const coverRel = (data.relationships || []).find((r) => r.type === 'cover_art');
  if (coverRel?.attributes?.fileName) {
    cover = `https://uploads.mangadex.org/covers/${apiId}/${coverRel.attributes.fileName}.512.jpg`;
  }

  const chapRes = await fetchText(
    `https://api.mangadex.org/chapter?manga=${apiId}&limit=50&order[chapter]=desc&translatedLanguage[]=fr&translatedLanguage[]=en`
  );
  let chapters = [];
  if (!chapRes.error && chapRes.json?.data) {
    chapters = chapRes.json.data.map((ch) => ({
      id: ch.id,
      number: parseFloat(ch.attributes?.chapter || 0),
      title: ch.attributes?.title || `Chapitre ${ch.attributes?.chapter}`,
      url: `https://mangadex.org/chapter/${ch.id}`,
      date: ch.attributes?.publishAt?.slice(0, 10) || '',
      pages: ch.attributes?.pages || 0,
    }));
  }

  const statusMap = { ongoing: 'En cours', completed: 'Terminé', hiatus: 'En pause', cancelled: 'Annulé' };

  return {
    title,
    cover,
    description,
    altTitles,
    genre: tags.join(' • '),
    rating: null,
    status: statusMap[attrs.status] || 'En cours',
    chapters,
    error: null,
  };
}

// ─── Generic HTML scraper ─────────────────────────────────────────────────────

async function parseGenericHtml(url) {
  const { text, isHtml, error } = await fetchText(url);
  if (error) return { error };
  if (!isHtml) return { error: 'La page ne semble pas être une page HTML valide.' };

  return {
    title: parseTitle(text),
    cover: parseCover(text, url),
    description: parseDescription(text),
    altTitles: parseAltTitles(text),
    genre: parseGenre(text),
    rating: parseRating(text),
    status: parseStatus(text),
    chapters: parseChapters(text, url),
    error: null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch complete manga details from any URL.
 * Returns a normalised manga object or { error: string }.
 *
 * Shape:
 * {
 *   title, cover, description, altTitles, genre, rating, status,
 *   chapters: [{ id, number, title, url, date, pages }],
 *   sourceUrl,
 *   error,
 * }
 */
export async function fetchMangaFromUrl(rawUrl) {
  const { url, error: validationError } = sanitizeUrl(rawUrl);
  if (validationError) return { error: validationError };

  let result;
  const platform = detectPlatform(url);

  try {
    if (platform === 'mangadex') {
      result = await parseMangaDex(url);
    } else {
      result = await parseGenericHtml(url);
    }
  } catch (err) {
    return { error: 'Une erreur inattendue s\'est produite. Réessayez.' };
  }

  if (result.error) return result;

  if (!result.title) {
    return { error: 'Impossible d\'extraire le titre du manga. Ce site n\'est peut-être pas compatible.' };
  }

  return {
    id: `scraped_${Date.now()}`,
    title: result.title,
    cover: result.cover || null,
    description: result.description || '',
    altTitles: result.altTitles || [],
    genre: result.genre || '',
    rating: result.rating,
    status: result.status || 'En cours',
    chapters: result.chapters || [],
    sourceUrl: url,
    error: null,
  };
}

export { fetchMangaFromUrl as fetchMangaDetails };
