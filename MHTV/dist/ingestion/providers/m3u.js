import { appConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";
import { loadProviderConfig } from "../../lib/provider-config.js";
import { BaseProvider } from "./base.js";
import { parseM3U } from "../parsers/m3u.js";
import { parseXmltv } from "../parsers/xmltv.js";
const fetchText = async (url) => {
    const response = await fetch(url, {
        headers: {
            "User-Agent": appConfig.userAgent
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.text();
};
export class M3uProvider extends BaseProvider {
    id = "m3u";
    displayName = "Custom M3U";
    priority = 400;
    async ingest() {
        const providerConfig = loadProviderConfig();
        const feeds = [];
        const channels = [];
        const programmes = [];
        for (const url of providerConfig.m3uProviderUrls) {
            logger.info("Fetching custom M3U feed", { provider: this.id, url, region: providerConfig.m3uRegion });
            const content = await fetchText(url);
            channels.push(...parseM3U(this.id, content, { region: providerConfig.m3uRegion || "global" }));
            feeds.push({ kind: "m3u", url, region: providerConfig.m3uRegion || "global" });
        }
        for (const url of providerConfig.m3uEpgUrls) {
            logger.info("Fetching custom XMLTV feed", { provider: this.id, url, region: providerConfig.m3uRegion });
            const content = await fetchText(url);
            programmes.push(...parseXmltv(content));
            feeds.push({ kind: "xmltv", url, region: providerConfig.m3uRegion || "global" });
        }
        return {
            source: {
                id: this.id,
                name: this.displayName,
                priority: this.priority,
                baseRegion: providerConfig.m3uRegion || null,
                metadata: {
                    type: "remote",
                    playlistCount: providerConfig.m3uProviderUrls.length
                }
            },
            channels,
            programmes,
            feeds
        };
    }
}
