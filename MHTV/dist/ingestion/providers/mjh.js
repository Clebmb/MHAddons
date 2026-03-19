import { appConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";
import { inferMjhFamilyId, inferMjhFamilyLabel, SOURCE_FAMILY_HEADER } from "../../lib/provider-options.js";
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
const inferRegion = (url) => {
    const match = url.match(/\/([a-z]{2})\.(m3u8|xml)$/i);
    return match ? match[1].toLowerCase() : "global";
};
export class MjhProvider extends BaseProvider {
    id = "mjh";
    displayName = "i.mjh.nz";
    priority = 200;
    async ingest() {
        const feeds = [];
        const channels = [];
        const programmes = [];
        for (const url of appConfig.mjhProviderUrls) {
            const region = inferRegion(url);
            const familyId = inferMjhFamilyId(url);
            const familyLabel = inferMjhFamilyLabel(url);
            logger.info("Fetching M3U feed", { provider: this.id, url, region });
            const content = await fetchText(url);
            channels.push(...parseM3U(this.id, content, {
                region,
                headers: {
                    [SOURCE_FAMILY_HEADER]: familyId
                }
            }).map((channel) => ({
                ...channel,
                metadata: {
                    ...channel.metadata,
                    mjhFamily: familyId,
                    mjhFamilyLabel: familyLabel
                }
            })));
            feeds.push({ kind: "m3u", url, region });
        }
        for (const url of appConfig.mjhEpgUrls) {
            const region = inferRegion(url);
            logger.info("Fetching XMLTV feed", { provider: this.id, url, region });
            const content = await fetchText(url);
            programmes.push(...parseXmltv(content));
            feeds.push({ kind: "xmltv", url, region });
        }
        return {
            source: {
                id: this.id,
                name: this.displayName,
                priority: this.priority,
                baseRegion: null,
                metadata: { type: "remote" }
            },
            channels,
            programmes,
            feeds
        };
    }
}
