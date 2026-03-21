const supportsCatalog = (mode) => mode !== "streams_only";
const supportsStreams = (mode) => mode !== "catalog_only";
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
const shouldExposeGroupCatalog = (group) => !locationLikeGroups.has(group.trim().toLowerCase());
export function buildManifest(baseUrl, configToken, groups, config) {
    const groupCatalogs = config.catalogLayout === "search_only"
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
export function getSourceOrder(config) {
    return config.sources.length ? config.sources : ["tvapp", "mjh", "kptv", "xtream", "m3u"];
}
export function getCatalogSources(config) {
    return getSourceOrder(config).filter((sourceId) => {
        const modeBySource = {
            kptv: config.kptvMode,
            tvapp: config.tvappMode,
            mjh: config.mjhMode,
            xtream: config.xtreamMode,
            m3u: config.m3uMode
        };
        return supportsCatalog(modeBySource[sourceId] ?? "both");
    });
}
export function getStreamSourceOrder(config) {
    return getSourceOrder(config).filter((sourceId) => {
        const modeBySource = {
            kptv: config.kptvMode,
            tvapp: config.tvappMode,
            mjh: config.mjhMode,
            xtream: config.xtreamMode,
            m3u: config.m3uMode
        };
        return supportsStreams(modeBySource[sourceId] ?? "both");
    });
}
