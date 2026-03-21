import { appConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";
import { loadProviderConfig } from "../../lib/provider-config.js";
import type { ProviderIngestionResult } from "../../lib/types.js";
import { BaseProvider } from "./base.js";
import { parseM3U } from "../parsers/m3u.js";
import { parseXmltv } from "../parsers/xmltv.js";

const fetchText = async (url: string) => {
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

export class KptvProvider extends BaseProvider {
  id = "kptv";
  displayName = "KPTV FAST";
  priority = 250;

  async ingest(): Promise<ProviderIngestionResult> {
    const providerConfig = loadProviderConfig();
    const baseUrl = providerConfig.kptvBaseUrl.replace(/\/+$/, "");
    const playlistUrl = `${baseUrl}/playlist`;
    const epgUrl = `${baseUrl}/epg`;

    logger.info("Fetching KPTV playlist", { provider: this.id, url: playlistUrl, region: providerConfig.kptvRegion });
    const playlist = await fetchText(playlistUrl);
    const channels = parseM3U(this.id, playlist, { region: providerConfig.kptvRegion || "global" }).map((channel) => ({
      ...channel,
      metadata: {
        ...channel.metadata,
        provider: this.id,
        upstream: "kptv-fast"
      }
    }));

    let programmes: ProviderIngestionResult["programmes"] = [];
    try {
      logger.info("Fetching KPTV EPG", { provider: this.id, url: epgUrl, region: providerConfig.kptvRegion });
      const epg = await fetchText(epgUrl);
      programmes = parseXmltv(epg);
    } catch (error) {
      logger.warn("KPTV EPG fetch failed", {
        provider: this.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return {
      source: {
        id: this.id,
        name: this.displayName,
        priority: this.priority,
        baseRegion: providerConfig.kptvRegion || null,
        metadata: {
          type: "remote",
          baseUrl
        }
      },
      channels,
      programmes,
      feeds: [
        { kind: "m3u", url: playlistUrl, region: providerConfig.kptvRegion || "global" },
        ...(programmes.length ? [{ kind: "xmltv" as const, url: epgUrl, region: providerConfig.kptvRegion || "global" }] : [])
      ]
    };
  }
}
