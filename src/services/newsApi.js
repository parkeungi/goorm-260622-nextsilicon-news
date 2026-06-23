// 브라우저에서 newsapi.org로 직접 요청하면 CORS에 막히므로 항상 프록시를 경유한다.
// - 개발: Vite 개발 서버 프록시 (vite.config.js의 server.proxy)
// - 배포: Vercel rewrites (vercel.json)
// LLM API 3종(/proxy/anthropic, /proxy/openai, /proxy/gemini)과 동일한 방식.
const BASE_URL = "/proxy/newsapi/v2/everything";

export async function fetchNews(query, options = {}) {
  const {
    language = "en",
    sortBy = "publishedAt",
    pageSize = 10,
    from,
  } = options;

  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  const params = new URLSearchParams({
    q: query,
    language,
    sortBy,
    pageSize: String(pageSize),
    apiKey,
  });

  if (from) params.append("from", from);

  const response = await fetch(`${BASE_URL}?${params}`);

  if (response.status === 401) {
    throw new Error("뉴스 API Key를 확인해 주세요.");
  }
  if (response.status === 429) {
    throw new Error(
      "오늘 뉴스 조회 한도(100건/일)를 초과했습니다. 내일 다시 시도해 주세요."
    );
  }
  if (!response.ok) {
    throw new Error("네트워크 연결을 확인해 주세요.");
  }

  const data = await response.json();
  return normalizeArticles(data.articles || []);
}

export function normalizeArticles(rawArticles) {
  return rawArticles.map((a) => ({
    title: a.title || "(제목 없음)",
    description: a.description || "(요약 없음)",
    url: a.url || "",
    source: { name: a.source?.name || "알 수 없음" },
    publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    urlToImage: a.urlToImage || "",
  }));
}
