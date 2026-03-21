import { makeCanonicalSlug, makeStremioId, normalizeText } from "../../lib/ids.js";
import { appConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";
import { loadProviderConfig } from "../../lib/provider-config.js";
import type { NormalizedChannel, ProviderIngestionResult } from "../../lib/types.js";
import { BaseProvider } from "./base.js";
import { parseXmltv } from "../parsers/xmltv.js";

interface XtreamCategory {
  category_id?: string | number;
  category_name?: string;
}

interface XtreamLiveStream {
  stream_id?: string | number;
  name?: string;
  category_id?: string | number;
  stream_icon?: string;
  epg_channel_id?: string;
  tv_archive_duration?: string | number;
  container_extension?: string;
}

const buildUrl = (path: string) => {
  const baseUrl = loadProviderConfig().xtreamBaseUrl.replace(/\/+$/, "");
  return `${baseUrl}${path}`;
};

const fetchJson = async <T>(url: string) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": appConfig.userAgent,
      Accept: "application/json,text/plain,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
};

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

export class XtreamProvider extends BaseProvider {
  id = "xtream";
  displayName = "Xtream Codes";
  priority = 300;

  async ingest(): Promise<ProviderIngestionResult> {
    const providerConfig = loadProviderConfig();
    const username = providerConfig.xtreamUsername;
    const password = providerConfig.xtreamPassword;
    const baseUrl = providerConfig.xtreamBaseUrl.replace(/\/+$/, "");

    const authQuery = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const categoriesUrl = buildUrl(`/player_api.php?${authQuery}&action=get_live_categories`);
    const streamsUrl = buildUrl(`/player_api.php?${authQuery}&action=get_live_streams`);
    const xmltvUrl = providerConfig.xtreamXmltvUrl || buildUrl(`/xmltv.php?${authQuery}`);

    logger.info("Fetching Xtream live categories", { provider: this.id, url: categoriesUrl });
    const categories = await fetchJson<XtreamCategory[]>(categoriesUrl);
    logger.info("Fetching Xtream live streams", { provider: this.id, url: streamsUrl });
    const streams = await fetchJson<XtreamLiveStream[]>(streamsUrl);

    const categoryById = new Map(
      categories.map((category) => [String(category.category_id ?? ""), normalizeText(category.category_name ?? "Live TV")])
    );

    const channels: NormalizedChannel[] = streams
      .filter((stream) => stream.stream_id && stream.name)
      .map((stream) => {
        const streamId = String(stream.stream_id);
        const name = normalizeText(String(stream.name ?? `Xtream ${streamId}`));
        const categoryId = String(stream.category_id ?? "");
        const groupTitle = categoryById.get(categoryId) || "Live TV";
        const region = providerConfig.xtreamRegion || "global";
        const slug = makeCanonicalSlug(region, "xtream", stream.epg_channel_id ?? streamId, name);
        const containerExtension = String(stream.container_extension || "ts").replace(/[^a-z0-9]/gi, "") || "ts";
        const streamUrl = `${baseUrl}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${encodeURIComponent(streamId)}.${containerExtension}`;

        return {
          stremioId: makeStremioId(slug),
          canonicalSlug: slug,
          name,
          tvgId: stream.epg_channel_id ? String(stream.epg_channel_id) : null,
          tvgName: name,
          tvgLogo: stream.stream_icon ? String(stream.stream_icon) : null,
          groupTitle,
          sourceId: this.id,
          region,
          countryCode: region === "global" ? null : region.toUpperCase(),
          language: null,
          isGeoBlocked: false,
          quality: null,
          website: null,
          description: null,
          metadata: {
            provider: this.id,
            xtreamCategoryId: categoryId || null,
            xtreamStreamId: streamId,
            xtreamArchiveDuration: stream.tv_archive_duration ? String(stream.tv_archive_duration) : null
          },
          aliases: [name, stream.epg_channel_id ? String(stream.epg_channel_id) : null].filter(Boolean) as string[],
          streams: [
            {
              sourceId: this.id,
              streamUrl,
              backupStreamUrl: null,
              referer: baseUrl,
              userAgent: appConfig.userAgent,
              headers: {
                Referer: baseUrl,
                "User-Agent": appConfig.userAgent
              },
              quality: null,
              priority: 100
            }
          ]
        };
      });

    let programmes: ProviderIngestionResult["programmes"] = [];
    try {
      logger.info("Fetching Xtream XMLTV feed", { provider: this.id, url: xmltvUrl });
      const xmltvContent = await fetchText(xmltvUrl);
      programmes = parseXmltv(xmltvContent);
    } catch (error) {
      logger.warn("Xtream XMLTV fetch failed", {
        provider: this.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return {
      source: {
        id: this.id,
        name: this.displayName,
        priority: this.priority,
        baseRegion: providerConfig.xtreamRegion || null,
        metadata: {
          type: "remote",
          baseUrl
        }
      },
      channels,
      programmes,
      feeds: [
        { kind: "m3u", url: streamsUrl, region: providerConfig.xtreamRegion || "global" },
        ...(programmes.length ? [{ kind: "xmltv" as const, url: xmltvUrl, region: providerConfig.xtreamRegion || "global" }] : [])
      ]
    };
  }
}
