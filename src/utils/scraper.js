/**
 * Yomu AI - Manga Scraper Utility
 * Robust scraper with HTML/JSON detection and fallback parsing.
 */

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

/**
 * Detect whether a string is an HTML document rather than JSON.
 */
function isHtmlResponse(text) {
  const trimmed = text.trimStart();
  return (
    trimmed.startsWith('<!') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<HTML') ||
    trimmed.startsWith('<')
  );
}

/**
 * Safe JSON parse — returns null instead of throwing on bad input.
 */
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Fetch a URL and return { ok, status, text, json, isHtml }.
 * Never throws — all errors are captured in the returned object.
 */
async function safeFetch(url, options = {}) {
  const result = {
    ok: false,
    status: null,
    text: '',
    json: null,
    isHtml: false,
    error: null,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json, text/html, */*',
        ...(options.headers || {}),
      },
    });

    result.ok = response.ok;
    result.status = response.status;
    result.text = await response.text();
    result.isHtml = isHtmlResponse(result.text);

    if (!result.isHtml) {
      result.json = safeJsonParse(result.text);
    }
  } catch (err) {
    result.error = err.message || String(err);
  }

  return result;
}

/**
 * Extract a value from an HTML string using a simple regex pattern.
 * Returns null if not found.
 */
function extractFromHtml(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Parse a manga title from an HTML page.
 */
function parseTitleFromHtml(html) {
  return extractFromHtml(html, [
    /<h1[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([\s\S]*?)<\/title>/i,
    /property="og:title"\s+content="([^"]+)"/i,
    /name="title"\s+content="([^"]+)"/i,
  ]);
}

/**
 * Parse a cover image URL from an HTML page.
 */
function parseCoverFromHtml(html) {
  return extractFromHtml(html, [
    /property="og:image"\s+content="([^"]+)"/i,
    /<img[^>]*class="[^"]*cover[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*class="[^"]*thumbnail[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*src="([^"]+)"[^>]*class="[^"]*cover[^"]*"/i,
  ]);
}

/**
 * Parse a list of chapters from an HTML page.
 * Returns an array of { title, url } objects.
 */
function parseChaptersFromHtml(html, baseUrl) {
  const chapters = [];
  const chapterPattern =
    /<a[^>]*href="([^"]*(?:chapter|ch)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = chapterPattern.exec(html)) !== null) {
    let url = match[1];
    const title = match[2].replace(/<[^>]+>/g, '').trim();

    if (!url.startsWith('http')) {
      try {
        const base = new URL(baseUrl);
        url = `${base.origin}${url.startsWith('/') ? '' : '/'}${url}`;
      } catch {
        continue;
      }
    }

    if (title && url) {
      chapters.push({ title, url });
    }
  }

  return chapters;
}

/**
 * Main function: fetch manga details from any URL.
 * Handles both JSON API responses and HTML pages gracefully.
 *
 * @param {string} url - The manga page or API endpoint URL.
 * @returns {Promise<{ title, cover, chapters, error }>}
 */
async function fetchMangaDetails(url) {
  const response = await safeFetch(url);

  if (response.error) {
    return {
      title: null,
      cover: null,
      chapters: [],
      error: `Network error: ${response.error}`,
    };
  }

  if (!response.ok) {
    return {
      title: null,
      cover: null,
      chapters: [],
      error: `Server returned status ${response.status}`,
    };
  }

  if (response.json) {
    const data = response.json;
    return {
      title: data.title || data.name || data.manga_name || null,
      cover: data.cover || data.image || data.thumbnail || null,
      chapters: Array.isArray(data.chapters)
        ? data.chapters.map((ch) => ({
            title: ch.title || ch.name || ch.chapter_name || '',
            url: ch.url || ch.link || '',
          }))
        : [],
      error: null,
    };
  }

  if (response.isHtml) {
    const html = response.text;
    return {
      title: parseTitleFromHtml(html),
      cover: parseCoverFromHtml(html),
      chapters: parseChaptersFromHtml(html, url),
      error: null,
    };
  }

  return {
    title: null,
    cover: null,
    chapters: [],
    error: 'Unrecognised response format',
  };
}

/**
 * Fetch a list of manga from a source that may return JSON or HTML.
 * Supports OlympusStaff-style sites that sometimes return HTML error pages.
 *
 * @param {string} url - The listing endpoint.
 * @returns {Promise<Array<{ title, cover, url }>>}
 */
async function fetchMangaList(url) {
  const response = await safeFetch(url);

  if (response.error || !response.ok) {
    console.warn(
      `[Scraper] Failed to fetch list from ${url}:`,
      response.error || `HTTP ${response.status}`
    );
    return [];
  }

  if (response.json) {
    const data = response.json;
    const list = Array.isArray(data)
      ? data
      : data.data || data.results || data.manga || [];

    return list.map((item) => ({
      title: item.title || item.name || '',
      cover: item.cover || item.image || item.thumbnail || '',
      url: item.url || item.link || '',
    }));
  }

  if (response.isHtml) {
    console.warn(
      `[Scraper] ${url} returned an HTML page instead of JSON. Attempting HTML parse.`
    );
    const html = response.text;
    const mangaPattern =
      /<a[^>]*href="([^"]*(?:manga|series|comic)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const items = [];
    let match;

    while ((match = mangaPattern.exec(html)) !== null) {
      const itemUrl = match[1];
      const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();
      if (rawTitle && itemUrl) {
        items.push({ title: rawTitle, cover: '', url: itemUrl });
      }
    }

    return items;
  }

  return [];
}

export { fetchMangaDetails, fetchMangaList, safeFetch };
