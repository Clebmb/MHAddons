import type { AddonConfig } from "../lib/types.js";

const supportsCatalog = (mode: AddonConfig["tvappMode"]) => mode !== "streams_only";
const supportsStreams = (mode: AddonConfig["tvappMode"]) => mode !== "catalog_only";

export function buildManifest(baseUrl: string, configToken: string, groups: string[], config: AddonConfig) {
  const groupCatalogs =
    config.catalogLayout === "search_only"
      ? []
      : groups.map((group) => ({
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
  return config.sources.length ? config.sources : ["tvapp", "mjh"];
}

export function getCatalogSources(config: AddonConfig) {
  return getSourceOrder(config).filter((sourceId) => {
    if (sourceId === "tvapp") {
      return supportsCatalog(config.tvappMode);
    }
    if (sourceId === "mjh") {
      return supportsCatalog(config.mjhMode);
    }
    return true;
  });
}

export function getStreamSourceOrder(config: AddonConfig) {
  return getSourceOrder(config).filter((sourceId) => {
    if (sourceId === "tvapp") {
      return supportsStreams(config.tvappMode);
    }
    if (sourceId === "mjh") {
      return supportsStreams(config.mjhMode);
    }
    return true;
  });
}
