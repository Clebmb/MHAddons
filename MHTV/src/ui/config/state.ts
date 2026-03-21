import type { AddonConfig } from "../../lib/types.js";
import { appConfig } from "../../lib/config.js";
import { knownMjhFamilyOptions, listMjhFamilyOptions } from "../../lib/provider-options.js";
import { hasKptvProvider, hasM3uProvider, hasXtreamProvider } from "../../lib/provider-config.js";

const defaultMjhFamilies = listMjhFamilyOptions(appConfig.mjhProviderUrls).map((option) => option.id);
const allKnownMjhFamilies = knownMjhFamilyOptions.map((option) => option.id);
const defaultSources = ["tvapp", "mjh"];

if (hasKptvProvider()) {
  defaultSources.push("kptv");
}

if (hasXtreamProvider()) {
  defaultSources.push("xtream");
}

if (hasM3uProvider()) {
  defaultSources.push("m3u");
}

const defaultConfig: AddonConfig = {
  sources: defaultSources,
  regions: [],
  resolution: "source_priority",
  streamValidation: "balanced",
  catalogLayout: "grouped",
  kptvMode: "both",
  tvappMode: "both",
  mjhMode: "both",
  xtreamMode: "both",
  m3uMode: "both",
  tvappSourceFamilies: ["thetvapp", "tvpass", "moveonjoy"],
  mjhFeedFamilies: allKnownMjhFamilies.length ? allKnownMjhFamilies : defaultMjhFamilies,
  includeGroups: [],
  excludeGroups: []
};

export function encodeConfig(config: AddonConfig) {
  return Buffer.from(JSON.stringify(config), "utf8").toString("base64url");
}

export function decodeConfig(value?: string): AddonConfig {
  if (!value) {
    return defaultConfig;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<AddonConfig>;
    return {
      sources: parsed.sources?.length ? parsed.sources : defaultConfig.sources,
      regions: parsed.regions?.length ? parsed.regions : defaultConfig.regions,
      resolution: parsed.resolution ?? defaultConfig.resolution,
      streamValidation: parsed.streamValidation ?? defaultConfig.streamValidation,
      catalogLayout: parsed.catalogLayout ?? defaultConfig.catalogLayout,
      kptvMode: parsed.kptvMode ?? defaultConfig.kptvMode,
      tvappMode: parsed.tvappMode ?? defaultConfig.tvappMode,
      mjhMode: parsed.mjhMode ?? defaultConfig.mjhMode,
      xtreamMode: parsed.xtreamMode ?? defaultConfig.xtreamMode,
      m3uMode: parsed.m3uMode ?? defaultConfig.m3uMode,
      tvappSourceFamilies: parsed.tvappSourceFamilies?.length
        ? parsed.tvappSourceFamilies
        : defaultConfig.tvappSourceFamilies,
      mjhFeedFamilies: parsed.mjhFeedFamilies?.length ? parsed.mjhFeedFamilies : defaultConfig.mjhFeedFamilies,
      includeGroups: parsed.includeGroups ?? [],
      excludeGroups: parsed.excludeGroups ?? []
    };
  } catch {
    return defaultConfig;
  }
}

export function getDefaultConfig() {
  return structuredClone(defaultConfig);
}
