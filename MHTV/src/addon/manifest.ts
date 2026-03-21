import type { AddonConfig } from "../lib/types.js";

const supportsCatalog = (mode: AddonConfig["tvappMode"]) => mode !== "streams_only";
const supportsStreams = (mode: AddonConfig["tvappMode"]) => mode !== "catalog_only";
const locationLikeGroups = new Set([
  "adelaide",
  "au",
  "brisbane",
  "canberra",
  "darwin",
  "hobart",
  "locals",
  "melbourne",
  "nz",
  "perth",
  "sydney",
  "world"
]);

const shouldExposeGroupCatalog = (group: string) => !locationLikeGroups.has(group.trim().toLowerCase());

export function buildManifest(baseUrl: string, configToken: string, groups: string[], config: AddonConfig) {
  const groupCatalogs =
    config.catalogLayout === "search_only"
      ? []
      : groups.filter(shouldExposeGroupCatalog).map((group) => ({
          type: "tv",
          id: `group:${encodeURIComponent(group)}`,
          name: `MHTV - ${group}`,
          extra: [{ name: "skip", isRequired: false }]
        }));

  return {
    id: "org.mediahoard.mhtv",
    version: "0.1.0",
    name: "MHTV",
    description: "Free IPTV aggregation addon for MediaHoard",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["mhtv:channel:"],
    catalogs: [
      {
        type: "tv",
        id: "mhtv-search",
        name: "MHTV Search",
        extra: [{ name: "search", isRequired: false }]
      },
      ...groupCatalogs
    ],
    behaviorHints: {
      configurable: true,
      configurationRequired: false
    },
    logo: `${baseUrl}/assets/logo.svg`,
    background: `${baseUrl}/assets/background.svg`,
    contactEmail: "support@mediahoard.local"
  };
}

export function getSourceOrder(config: AddonConfig) {
  return config.sources.length ? config.sources : ["tvapp", "mjh", "kptv", "xtream", "m3u"];
}

export function getCatalogSources(config: AddonConfig) {
  return getSourceOrder(config).filter((sourceId) => {
    const modeBySource = {
      kptv: config.kptvMode,
      tvapp: config.tvappMode,
      mjh: config.mjhMode,
      xtream: config.xtreamMode,
      m3u: config.m3uMode
    } as const;
    return supportsCatalog(modeBySource[sourceId as keyof typeof modeBySource] ?? "both");
  });
}

export function getStreamSourceOrder(config: AddonConfig) {
  return getSourceOrder(config).filter((sourceId) => {
    const modeBySource = {
      kptv: config.kptvMode,
      tvapp: config.tvappMode,
      mjh: config.mjhMode,
      xtream: config.xtreamMode,
      m3u: config.m3uMode
    } as const;
    return supportsStreams(modeBySource[sourceId as keyof typeof modeBySource] ?? "both");
  });
}
