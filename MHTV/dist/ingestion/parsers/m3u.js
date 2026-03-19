import { makeCanonicalSlug, makeStremioId, normalizeText } from "../../lib/ids.js";
const parseAttributes = (line) => {
    const attributes = {};
    const regex = /([A-Za-z0-9\-_]+)="([^"]*)"/g;
    for (const match of line.matchAll(regex)) {
        attributes[match[1]] = match[2];
    }
    return attributes;
};
const inferQuality = (name, url) => {
    const sample = `${name} ${url}`.toLowerCase();
    if (sample.includes("1080") || sample.includes("fhd")) {
        return "fhd";
    }
    if (sample.includes("720") || sample.includes("hd")) {
        return "hd";
    }
    if (sample.includes("480") || sample.includes("sd")) {
        return "sd";
    }
    return null;
};
export function parseM3U(sourceId, content, options = {}) {
    const lines = content.split(/\r?\n/);
    const channels = [];
    let pendingMeta = null;
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            continue;
        }
        if (line.startsWith("#EXTINF:")) {
            const attrs = parseAttributes(line);
            const name = normalizeText(line.split(",").slice(1).join(",") || attrs["tvg-name"] || "Unknown");
            pendingMeta = { attrs, name };
            continue;
        }
        if (line.startsWith("#")) {
            continue;
        }
        if (!pendingMeta) {
            continue;
        }
        const region = options.region ?? pendingMeta.attrs["region"] ?? null;
        const groupTitle = pendingMeta.attrs["group-title"] || "General";
        const slug = makeCanonicalSlug(region ?? "global", pendingMeta.attrs["tvg-id"] ?? pendingMeta.name);
        const stream = {
            sourceId,
            streamUrl: line,
            backupStreamUrl: null,
            referer: options.headers?.Referer ?? null,
            userAgent: options.headers?.["User-Agent"] ?? null,
            headers: options.headers ?? {},
            quality: inferQuality(pendingMeta.name, line),
            priority: 100
        };
        channels.push({
            stremioId: makeStremioId(slug),
            canonicalSlug: slug,
            name: pendingMeta.name,
            tvgId: pendingMeta.attrs["tvg-id"] ?? null,
            tvgName: pendingMeta.attrs["tvg-name"] ?? pendingMeta.name,
            tvgLogo: pendingMeta.attrs["tvg-logo"] ?? null,
            groupTitle,
            sourceId,
            region,
            countryCode: region ? region.toUpperCase() : null,
            language: pendingMeta.attrs["tvg-language"] ?? null,
            isGeoBlocked: Boolean(region),
            quality: stream.quality,
            website: pendingMeta.attrs["tvg-url"] ?? null,
            description: null,
            metadata: {
                tvgShift: pendingMeta.attrs["tvg-shift"] ?? null,
                provider: sourceId
            },
            aliases: [pendingMeta.name, pendingMeta.attrs["tvg-name"], pendingMeta.attrs["channel-id"]].filter(Boolean),
            streams: [stream]
        });
        pendingMeta = null;
    }
    return channels;
}
