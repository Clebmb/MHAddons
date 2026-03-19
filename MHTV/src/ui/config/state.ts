import type { AddonConfig } from "../../lib/types.js";
import { appConfig } from "../../lib/config.js";
import { knownMjhFamilyOptions, listMjhFamilyOptions } from "../../lib/provider-options.js";

const defaultMjhFamilies = listMjhFamilyOptions(appConfig.mjhProviderUrls).map((option) => option.id);
const allKnownMjhFamilies = knownMjhFamilyOptions.map((option) => option.id);

const defaultConfig: AddonConfig = {
  sources: ["tvapp", "mjh"],
  regions: ["us"],
  resolution: "source_priority",
  streamValidation: "balanced",
  catalogLayout: "grouped",
  tvappMode: "both",
  mjhMode: "both",
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
      tvappMode: parsed.tvappMode ?? defaultConfig.tvappMode,
      mjhMode: parsed.mjhMode ?? defaultConfig.mjhMode,
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
