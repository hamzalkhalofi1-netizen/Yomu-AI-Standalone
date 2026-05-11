/**
 * Yomu AI — Manga Scraper & Search Utility
 * - URL scraping: MangaDex API-first, generic HTML fallback
 * - Title search: Jikan (MyAnimeList) public API — no auth needed
 * - CORS proxies: rotates through 3 proxies on web
 * - Never throws — all paths return { error } on failure
 */

import { Platform } from 'react-native';

const TIMEOUT_MS = 14000;
const UA =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

// Rotate through proxies if one fails
const CORS_PROXIES = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
];

// ─── URL Validation ───────────────────────────────────────────────────────────

/**
 * Validate and normalise a raw string into a full URL.
 * Returns { url, error }.
 */
export function sanitizeUrl(raw) {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return { url: null, error: 'Veuillez entrer une URL valide.' };
  }
  let s = raw.trim();
  if (!s.startsWith('http://') && !s.startsWith('https://')) {
    s = 'https://' + s;
  }
  try {
    const p = new URL(s);
    if (!p.hostname || !p.hostname.includes('.')) {
      return { url: null, error: 'Le domaine est invalide.' };
    }
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0'];
    if (blocked.some((b) => p.hostname.includes(b))) {
      return { url: null, error: 'Ce domaine n\'est pas autorisé.' };
    }
    return { url: p.href, error: null };
  } catch {
    return { url: null, error: "Format d'URL non reconnu. Exemple : https://mangadex.org/title/..." };
  }
}

function detectPlatform(url) {
  try {
    const h = new URL(url).hostname.replace('www.', '');
    if (h.includes('mangadex.org')) return 'mangadex';
    if (h.includes('myanimelist.net') || h.includes('jikan')) return 'mal';
    return 'generic';
  } catch {
    return 'generic';
  }
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function timedFetch(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: 'application/json, text/html, */*', ...(opts.headers || {}) },
    });
    clearTimeout(timer);
    return { res, error: null };
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') return { res: null, error: 'La connexion a expiré (timeout).' };
    return { res: null, error: 'Impossible de contacter le serveur.' };
  }
}

async function fetchText(url, allowProxy = true) {
  // On native, fetch directly
  if (Platform.OS !== 'web' || !allowProxy) {
    const { res, error } = await timedFetch(url);
    if (error) return { text: null, json: null, isHtml: false, error };
    if (!res.ok) return { text: null, json: null, isHtml: false, error: `Erreur HTTP ${res.status}.` };
    return parseResponse(res);
  }

  // On web, try each CORS proxy in turn
  let lastError = 'Aucun proxy CORS disponible.';
  for (const buildProxy of CORS_PROXIES) {
    const proxyUrl = buildProxy(url);
    const { res, error } = await timedFetch(proxyUrl);
    if (error) { lastError = error; continue; }
    if (!res.ok) { lastError = `Erreur HTTP ${res.status}.`; continue; }
    const result = await parseResponse(res);
    if (!result.error) return result;
    lastError = result.error;
  }
  return { text: null, json: null, isHtml: false, error: lastError };
}

async function parseResponse(res) {
  try {
    const text = await res.text();
    const t = text.trimStart();
    const isHtml =
      t.startsWith('<!') || t.startsWith('<html') || t.startsWith('<HTML') ||
      (t.startsWith('<') && !t.startsWith('<?xml'));
    let json = null;
    if (!isHtml) { try { json = JSON.parse(text); } catch { /* ok */ } }
    return { text, json, isHtml, error: null };
  } catch {
    return { text: null, json: null, isHtml: false, error: 'Impossible de lire la réponse.' };
  }
}

// ─── HTML Parsers ─────────────────────────────────────────────────────────────

function firstMatch(html, patterns) {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      return m[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

function parseTitle(html) {
  return firstMatch(html, [
    /property="og:title"\s+content="([^"]+)"/i,
    /name="twitter:title"\s+content="([^"]+)"/i,
    /<h1[^>]*class="[^"]*(?:title|name|series)[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([^|–\-<]{4,60})/i,
  ]);
}

function parseCover(html, baseUrl) {
  const raw = firstMatch(html, [
    /property="og:image"\s+content="([^"]+)"/i,
    /name="twitter:image"\s+content="([^"]+)"/i,
    /<img[^>]*class="[^"]*(?:cover|thumb|poster|series-img)[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*src="([^"]+)"[^>]*class="[^"]*(?:cover|thumb|poster)[^"]*"/i,
    /<img[^>]*class="[^"]*lazy[^"]*"[^>]*data-src="([^"]+\.(?:jpg|png|webp))"/i,
    /<img[^>]*data-src="([^"]+\.(?:jpg|png|webp))"[^>]*>/i,
  ]);
  return raw ? resolveUrl(raw, baseUrl) : null;
}

function parseRating(html) {
  const raw = firstMatch(html, [
    /itemprop="ratingValue"\s+content="([^"]+)"/i,
    /"ratingValue"\s*:\s*"?([\d.]+)"?/i,
    /class="[^"]*(?:score|rating-value|rate-num)[^"]*"[^>]*>\s*([\d.]+)/i,
  ]);
  if (!raw) return null;
  const n = parseFloat(raw);
  if (isNaN(n) || n > 10) return null;
  return Math.round(n * 10) / 10;
}

function parseDescription(html) {
  const raw = firstMatch(html, [
    /property="og:description"\s+content="([^"]{30,})"/i,
    /name="description"\s+content="([^"]{30,})"/i,
    /<div[^>]*(?:id|class)="[^"]*(?:synopsis|summary|description|story|about-summary)[^"]*"[^>]*>([\s\S]{30,600}?)<\/(div|p)/i,
    /<p[^>]*(?:id|class)="[^"]*(?:synopsis|summary|description)[^"]*"[^>]*>([\s\S]{30,600}?)<\/p>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>\s*<p>([\s\S]{60,600}?)<\/p>/i,
  ]);
  return raw || null;
}

function parseAltTitles(html) {
  const alts = [];
  const patterns = [
    /class="[^"]*(?:alt-title|alternative-title|other-name|also-known)[^"]*"[^>]*>([\s\S]{2,300}?)<\//i,
    /(?:alternative|other|alt)[\s-]*title[s]?[^:]*:\s*<\/[^>]+>\s*([\s\S]{2,200}?)<\/(td|div|p|li)/i,
    /(?:عناوين|titre[s]?\s*alternatif)[^:]*:\s*<\/[^>]+>\s*([\s\S]{2,200}?)<\/(td|div|p)/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        .split(/[;,|·•\/]/)
        .map((t) => t.trim()).filter((t) => t.length > 0)
        .forEach((t) => alts.push(t));
    }
  }
  return [...new Set(alts)].slice(0, 6);
}

function parseGenres(html) {
  // Try collecting multiple genre tags
  const tags = [];
  const re = /<a[^>]*(?:href|class)[^>]*(?:genre|tag|category|cat)[^>]*>\s*([^<]{2,30})\s*<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null && tags.length < 4) {
    const t = m[1].trim();
    if (t && !tags.includes(t)) tags.push(t);
  }
  if (tags.length) return tags.join(' • ');
  return firstMatch(html, [
    /property="og:genre"\s+content="([^"]+)"/i,
    /itemprop="genre"[^>]*>\s*([^<]{2,40})\s*</i,
  ]);
}

function parseStatus(html) {
  const raw = firstMatch(html, [
    /class="[^"]*status[^"]*"[^>]*>\s*([^<]{2,40})\s*</i,
    /(?:statut|status|publication|état)[^:]*:(?:<\/[^>]+>)?\s*([^<]{2,40})</i,
  ]);
  if (!raw) return 'En cours';
  const l = raw.toLowerCase();
  if (/complet|terminé|finished|completed/.test(l)) return 'Terminé';
  if (/hiatus|pause|dropped/.test(l)) return 'En pause';
  if (/annul|cancel/.test(l)) return 'Annulé';
  return 'En cours';
}

function parseChapters(html, baseUrl) {
  const chapters = [];
  const seen = new Set();
  const re = /<a[^>]+href="([^"]*(?:chapter|ch(?:ap)?[-_]?\d|chapitre|capitulo|vol[-_]?\d)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null && chapters.length < 200) {
    const rawTitle = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!rawTitle || rawTitle.length > 120) continue;
    const url = resolveUrl(m[1], baseUrl);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const numM = rawTitle.match(/(\d+(?:[.,]\d+)?)/);
    const number = numM ? parseFloat(numM[1].replace(',', '.')) : chapters.length + 1;
    const dateM = html.slice(Math.max(0, m.index - 400), m.index + 400)
      .match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})/i);
    chapters.push({
      id: `ch_${number}_${seen.size}`,
      number,
      title: rawTitle,
      url,
      date: dateM ? dateM[1] : '',
      pages: 0,
    });
  }
  return chapters.sort((a, b) => b.number - a.number);
}

function resolveUrl(href, baseUrl) {
  if (!href) return null;
  href = href.trim();
  if (href.startsWith('http')) return href;
  try {
    const b = new URL(baseUrl);
    if (href.startsWith('//')) return b.protocol + href;
    if (href.startsWith('/')) return b.origin + href;
    return b.origin + '/' + href;
  } catch {
    return null;
  }
}

// ─── Platform scrapers ────────────────────────────────────────────────────────

async function scrapeMangaDex(url) {
  const idM = url.match(/mangadex\.org\/title\/([a-f0-9-]{36})/i);
  if (!idM) return { error: 'URL MangaDex invalide — elle doit contenir un ID de 36 caractères.' };
  const id = idM[1];

  const { json: mangaJson, error: e1 } = await fetchText(
    `https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author`,
    false // MangaDex API has CORS, no proxy needed
  );
  if (e1) return { error: e1 };
  const d = mangaJson?.data;
  if (!d) return { error: 'Manga introuvable sur MangaDex.' };

  const attrs = d.attributes || {};
  const title = attrs.title?.fr || attrs.title?.en || Object.values(attrs.title || {})[0] || 'Sans titre';
  const description = attrs.description?.fr || attrs.description?.en || Object.values(attrs.description || {})[0] || '';
  const altTitles = (attrs.altTitles || []).flatMap((a) => Object.values(a)).filter(Boolean).slice(0, 6);
  const tags = (attrs.tags || []).map((t) => t.attributes?.name?.fr || t.attributes?.name?.en).filter(Boolean).slice(0, 4);

  let cover = null;
  const cr = (d.relationships || []).find((r) => r.type === 'cover_art');
  if (cr?.attributes?.fileName) {
    cover = `https://uploads.mangadex.org/covers/${id}/${cr.attributes.fileName}.512.jpg`;
  }

  const { json: chapJson } = await fetchText(
    `https://api.mangadex.org/chapter?manga=${id}&limit=96&order[chapter]=desc&translatedLanguage[]=fr&translatedLanguage[]=en`,
    false
  );
  const chapters = (chapJson?.data || []).map((ch) => ({
    id: ch.id,
    number: parseFloat(ch.attributes?.chapter || 0),
    title: ch.attributes?.title || `Chapitre ${ch.attributes?.chapter}`,
    url: `https://mangadex.org/chapter/${ch.id}`,
    date: ch.attributes?.publishAt?.slice(0, 10) || '',
    pages: ch.attributes?.pages || 0,
  }));

  const SM = { ongoing: 'En cours', completed: 'Terminé', hiatus: 'En pause', cancelled: 'Annulé' };
  return {
    title, cover, description, altTitles,
    genre: tags.join(' • '),
    rating: null,
    status: SM[attrs.status] || 'En cours',
    chapters, error: null,
  };
}

async function scrapeGenericHtml(url) {
  const { text, isHtml, error } = await fetchText(url);
  if (error) return { error };
  if (!isHtml) return { error: 'La page ne renvoie pas du HTML. Ce site n\'est peut-être pas compatible.' };
  return {
    title: parseTitle(text),
    cover: parseCover(text, url),
    description: parseDescription(text),
    altTitles: parseAltTitles(text),
    genre: parseGenres(text),
    rating: parseRating(text),
    status: parseStatus(text),
    chapters: parseChapters(text, url),
    error: null,
  };
}

// ─── Public: Scrape by URL ────────────────────────────────────────────────────

/**
 * Fetch manga details from any URL.
 * Returns a normalised manga object or { error }.
 */
export async function fetchMangaFromUrl(rawUrl) {
  const { url, error: ve } = sanitizeUrl(rawUrl);
  if (ve) return { error: ve };

  let result;
  try {
    result = detectPlatform(url) === 'mangadex'
      ? await scrapeMangaDex(url)
      : await scrapeGenericHtml(url);
  } catch {
    return { error: 'Une erreur inattendue s\'est produite. Réessayez.' };
  }

  if (result.error) return result;
  if (!result.title) {
    return { error: 'Impossible d\'extraire le titre. Le site n\'est peut-être pas compatible.' };
  }

  return {
    id: `scraped_${Date.now()}`,
    title: result.title,
    cover: result.cover || null,
    description: result.description || '',
    altTitles: result.altTitles || [],
    genre: result.genre || '',
    rating: result.rating || null,
    status: result.status || 'En cours',
    chapters: result.chapters || [],
    sourceUrl: url,
    error: null,
  };
}

// ─── Public: Search by title (Jikan / MAL API) ───────────────────────────────

/**
 * Search manga by title using the free Jikan API (MyAnimeList).
 * Returns Array<MangaItem> or { error }.
 */
export async function searchMangaByTitle(query) {
  if (!query || !query.trim()) return { error: 'Entrez un titre à rechercher.' };

  const q = encodeURIComponent(query.trim());
  const { json, error } = await fetchText(
    `https://api.jikan.moe/v4/manga?q=${q}&limit=12&order_by=score&sort=desc`,
    false // Jikan has proper CORS
  );
  if (error) return { error };
  if (!json?.data) return { error: 'Aucun résultat trouvé.' };

  const results = json.data.map((m) => ({
    id: `jikan_${m.mal_id}`,
    title: m.title_french || m.title || m.title_english || 'Sans titre',
    titleOriginal: m.title,
    cover: m.images?.jpg?.large_image_url || m.images?.jpg?.image_url || null,
    description: m.synopsis || '',
    altTitles: [m.title_english, m.title_japanese].filter(Boolean),
    genre: (m.genres || []).map((g) => g.name).slice(0, 3).join(' • '),
    rating: m.score ? Math.round(m.score * 10) / 10 : null,
    status: normalizeStatus(m.status),
    chapters: m.chapters ? buildMockChapterList(m.chapters) : [],
    views: m.members ? formatViews(m.members) : null,
    sourceUrl: m.url,
    malId: m.mal_id,
    error: null,
  }));

  return results;
}

function normalizeStatus(s) {
  if (!s) return 'En cours';
  const l = s.toLowerCase();
  if (l.includes('finish') || l.includes('complet')) return 'Terminé';
  if (l.includes('hiatus')) return 'En pause';
  if (l.includes('discontin') || l.includes('cancel')) return 'Annulé';
  return 'En cours';
}

function buildMockChapterList(count) {
  return Array.from({ length: Math.min(count, 50) }, (_, i) => ({
    id: `ch_mock_${count - i}`,
    number: count - i,
    title: `Chapitre ${count - i}`,
    url: '',
    date: '',
    pages: 0,
  }));
}

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export { fetchMangaFromUrl as fetchMangaDetails };
