import { Source } from "@/types/research";
import { extractDomain, truncateText } from "@/lib/utils";

export interface TavilySearchOptions {
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  includeRawContent?: boolean;
}

interface TavilyResultItem {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
  score?: number;
  published_date?: string;
}

interface TavilyResponse {
  query: string;
  results: TavilyResultItem[];
  answer?: string;
}

export async function searchTavily(
  query: string,
  options: TavilySearchOptions = {}
): Promise<Source[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "Tavily API key is missing. Please set TAVILY_API_KEY in your .env.local file."
    );
  }

  const payload = {
    api_key: apiKey.trim(),
    query: query.trim(),
    search_depth: options.searchDepth || "advanced",
    include_raw_content: options.includeRawContent ?? true,
    max_results: options.maxResults || 8,
    include_answer: false,
  };

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr = "";
      try {
        const json = JSON.parse(errText);
        parsedErr = json.detail || json.message || errText;
      } catch {
        parsedErr = errText;
      }
      throw new Error(`Tavily search API error (${res.status}): ${parsedErr}`);
    }

    const data: TavilyResponse = await res.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Process and deduplicate sources by domain and URL
    const seenUrls = new Set<string>();
    const seenDomains = new Set<string>();
    const structuredSources: Source[] = [];

    for (const item of data.results) {
      if (!item.url || seenUrls.has(item.url)) continue;

      const domain = extractDomain(item.url);
      // Prefer diverse domains if available, but allow multiple if necessary
      const isDuplicateDomain = seenDomains.has(domain);

      // Choose best content available (raw_content or content summary)
      const rawText = item.raw_content && item.raw_content.length > (item.content?.length || 0)
        ? item.raw_content
        : item.content || "";

      // Clean and truncate text
      const cleanContent = truncateText(rawText.replace(/\s+/g, " ").trim(), 4500);

      if (!cleanContent || cleanContent.length < 50) continue;

      seenUrls.add(item.url);
      seenDomains.add(domain);

      structuredSources.push({
        id: `src-${structuredSources.length + 1}`,
        title: item.title || `Source from ${domain}`,
        url: item.url,
        domain: domain,
        publishedDate: item.published_date,
        content: cleanContent,
        score: item.score,
      });

      // We want approximately 5 quality sources
      if (structuredSources.length >= 5) {
        break;
      }
    }

    // If domain deduplication was too strict and gave < 5, fill from remaining results
    if (structuredSources.length < 5) {
      for (const item of data.results) {
        if (!item.url || seenUrls.has(item.url)) continue;

        const rawText = item.raw_content || item.content || "";
        const cleanContent = truncateText(rawText.replace(/\s+/g, " ").trim(), 4500);
        if (!cleanContent || cleanContent.length < 50) continue;

        seenUrls.add(item.url);
        const domain = extractDomain(item.url);

        structuredSources.push({
          id: `src-${structuredSources.length + 1}`,
          title: item.title || `Source from ${domain}`,
          url: item.url,
          domain: domain,
          publishedDate: item.published_date,
          content: cleanContent,
          score: item.score,
        });

        if (structuredSources.length >= 5) break;
      }
    }

    return structuredSources;
  } catch (err: any) {
    console.error("[Tavily Tool Error]", err);
    throw new Error(err.message || "Failed to execute web search via Tavily");
  }
}
