import { Source } from "@/types/research";
import { searchTavily } from "@/lib/tools/tavily-search";

export interface ResearcherResult {
  sources: Source[];
  searchQuery: string;
}

export async function runResearcherAgent(
  topic: string,
  onProgress?: (message: string, details?: string) => void
): Promise<ResearcherResult> {
  onProgress?.("Formulating search strategy and querying Tavily...", `Topic: "${topic}"`);

  // Optimize search query
  const cleanTopic = topic.trim();
  const sources = await searchTavily(cleanTopic, {
    maxResults: 10,
    searchDepth: "advanced",
    includeRawContent: true,
  });

  if (sources.length === 0) {
    throw new Error(
      `No relevant sources could be found for "${topic}". Please refine or broaden your research topic.`
    );
  }

  onProgress?.(
    `Collected and curated ${sources.length} high-quality articles`,
    `Sources: ${sources.map((s) => s.domain).join(", ")}`
  );

  return {
    sources,
    searchQuery: cleanTopic,
  };
}
