import fs from "node:fs/promises";
import { appConfig } from "../../lib/config.js";
import { logger } from "../../lib/logger.js";
import { inferTvappSourceFamily, SOURCE_FAMILY_HEADER } from "../../lib/provider-options.js";
import type { ProviderIngestionResult } from "../../lib/types.js";
import { BaseProvider } from "./base.js";
import { parseM3U } from "../parsers/m3u.js";
import { parseXmltv } from "../parsers/xmltv.js";

export class TvappProvider extends BaseProvider {
  id = "tvapp";
  displayName = "TVApp2";
  priority = 100;

  async ingest(): Promise<ProviderIngestionResult> {
    logger.info("Reading TVApp feeds", { provider: this.id, m3u: appConfig.tvappM3uPath, xmltv: appConfig.tvappXmltvPath });
    const [m3uContent, xmltvContent] = await Promise.all([
      fs.readFile(appConfig.tvappM3uPath, "utf8"),
      fs.readFile(appConfig.tvappXmltvPath, "utf8")
    ]);
    const parsedChannels = parseM3U(this.id, m3uContent, {
      region: "us",
      headers: {
        Referer: appConfig.tvappBaseUrl,
        "User-Agent": appConfig.userAgent
      }
    }).map((channel) => ({
      ...channel,
      streams: channel.streams.map((stream) => {
        const family = inferTvappSourceFamily(stream.streamUrl);
        return {
          ...stream,
          headers: {
            ...stream.headers,
            [SOURCE_FAMILY_HEADER]: family
          }
        };
      }),
      metadata: {
        ...channel.metadata,
        tvappSourceFamily: inferTvappSourceFamily(channel.streams[0]?.streamUrl ?? "")
      }
    }));

    return {
      source: {
        id: this.id,
        name: this.displayName,
        priority: this.priority,
        baseRegion: "us",
        metadata: {
          type: "local",
          baseUrl: appConfig.tvappBaseUrl,
          healthUrl: appConfig.tvappHealthUrl
        }
      },
      channels: parsedChannels,
      programmes: parseXmltv(xmltvContent),
      feeds: [
        { kind: "m3u", localPath: appConfig.tvappM3uPath, region: "us" },
        { kind: "xmltv", localPath: appConfig.tvappXmltvPath, region: "us" }
      ]
    };
  }
}
