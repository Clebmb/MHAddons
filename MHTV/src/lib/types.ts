export interface AddonConfig {
  sources: string[];
  regions: string[];
  resolution: "prefer_hd" | "prefer_sd" | "source_priority";
  streamValidation: "balanced" | "fast" | "strict";
  catalogLayout: "grouped" | "search_only";
  tvappMode: "both" | "catalog_only" | "streams_only";
  mjhMode: "both" | "catalog_only" | "streams_only";
  tvappSourceFamilies: string[];
  mjhFeedFamilies: string[];
  includeGroups: string[];
  excludeGroups: string[];
}

export interface ProviderFeed {
  kind: "m3u" | "xmltv";
  region?: string;
  url?: string;
  localPath?: string;
}

export interface NormalizedChannel {
  stremioId: string;
  canonicalSlug: string;
  name: string;
  tvgId: string | null;
  tvgName: string | null;
  tvgLogo: string | null;
  groupTitle: string;
  sourceId: string;
  region: string | null;
  countryCode: string | null;
  language: string | null;
  isGeoBlocked: boolean;
  quality: string | null;
  website: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  aliases: string[];
  streams: NormalizedStream[];
}

export interface NormalizedStream {
  sourceId: string;
  streamUrl: string;
  backupStreamUrl: string | null;
  referer: string | null;
  userAgent: string | null;
  headers: Record<string, string>;
  quality: string | null;
  priority: number;
}

export interface NormalizedProgramme {
  channelKey: string;
  xmltvChannelId: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string[];
  startAt: string;
  endAt: string;
  episodeNum: string | null;
}

export interface ProviderIngestionResult {
  source: {
    id: string;
    name: string;
    priority: number;
    baseRegion: string | null;
    metadata?: Record<string, unknown>;
  };
  channels: NormalizedChannel[];
  programmes: NormalizedProgramme[];
  feeds: ProviderFeed[];
}

export interface Provider {
  id: string;
  displayName: string;
  priority: number;
  ingest(): Promise<ProviderIngestionResult>;
}
