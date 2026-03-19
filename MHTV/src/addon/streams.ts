import { getChannelByStremioId, getStreamsForChannel } from "../db/queries.js";
import { appConfig } from "../lib/config.js";
import { headProbe } from "../lib/http.js";
import { SOURCE_FAMILY_HEADER } from "../lib/provider-options.js";
import { getStreamSourceOrder } from "./manifest.js";
import type { AddonConfig } from "../lib/types.js";

const buildProxyUrl = (url: string, headers: Record<string, string>) => {
  const encodedHeaders = Buffer.from(JSON.stringify(headers), "utf8").toString("base64url");
  const encodedUrl = encodeURIComponent(url);
  return `${appConfig.baseUrl}/proxy?url=${encodedUrl}&headers=${encodedHeaders}`;
};

const sortByResolution = (resolution: AddonConfig["resolution"], streams: Awaited<ReturnType<typeof getStreamsForChannel>>) => {
  if (resolution === "source_priority") {
    return streams;
  }

  const preferred = resolution === "prefer_hd" ? ["fhd", "hd", "sd"] : ["sd", "hd", "fhd"];
  return [...streams].sort((left, right) => preferred.indexOf(String(left.quality)) - preferred.indexOf(String(right.quality)));
};

const filterProviderSpecificStreams = (
  config: AddonConfig,
  streams: Awaited<ReturnType<typeof getStreamsForChannel>>
) => {
  const mjhStreams = streams.filter((stream) => stream.source_id === "mjh");
  const availableMjhFamilies = new Set(
    mjhStreams
      .map((stream) => {
        const headers = (stream.http_headers as Record<string, string>) ?? {};
        return headers[SOURCE_FAMILY_HEADER] ?? headers[SOURCE_FAMILY_HEADER.toLowerCase()];
      })
      .filter(Boolean)
      .map((family) => String(family))
  );
  const activeMjhSelections = config.mjhFeedFamilies.filter((family) => availableMjhFamilies.has(family));

  return streams.filter((stream) => {
    const headers = (stream.http_headers as Record<string, string>) ?? {};
    const family = headers[SOURCE_FAMILY_HEADER] ?? headers[SOURCE_FAMILY_HEADER.toLowerCase()];

    if (stream.source_id === "tvapp") {
      return family ? config.tvappSourceFamilies.includes(String(family)) : true;
    }

    if (stream.source_id !== "mjh") {
      return true;
    }

    if (!config.mjhFeedFamilies.length) {
      return true;
    }

    if (!activeMjhSelections.length) {
      return true;
    }

    return family ? activeMjhSelections.includes(String(family)) : true;
  });
};

const sanitizeHeaders = (headers: Record<string, string>) =>
  Object.fromEntries(Object.entries(headers).filter(([key]) => !key.toLowerCase().startsWith("x-mhtv-")));

const buildStreamResponse = (
  channelName: string,
  sourceId: string,
  streamUrl: string,
  headers: Record<string, string>,
  titleSuffix?: string
) => ({
  streams: [
    {
      name: `MHTV ${String(sourceId).toUpperCase()}`,
      title: titleSuffix ? `${channelName} (${titleSuffix})` : `${channelName} (${sourceId})`,
      url: buildProxyUrl(streamUrl, headers),
      behaviorHints: {
        notWebReady: false
      }
    }
  ]
});

export async function buildStreams(type: string, id: string, config: AddonConfig) {
  if (type !== "tv") {
    return { streams: [] };
  }

  const channel = await getChannelByStremioId(id);
  if (!channel) {
    return { streams: [] };
  }

  const sourceOrder = getStreamSourceOrder(config);
  const streams = sortByResolution(
    config.resolution,
    filterProviderSpecificStreams(config, await getStreamsForChannel(channel.id as string, sourceOrder))
  );

  if (config.streamValidation === "fast") {
    const first = streams[0];
    if (!first) {
      return { streams: [] };
    }

    const headers = {
      ...(first.http_headers as Record<string, string>),
      ...(first.user_agent ? { "User-Agent": first.user_agent as string } : {}),
      ...(first.referer ? { Referer: first.referer as string } : {})
    };

    return buildStreamResponse(
      channel.name as string,
      String(first.source_id),
      first.stream_url as string,
      sanitizeHeaders(headers)
    );
  }

  for (const stream of streams) {
    const headers = {
      ...(stream.http_headers as Record<string, string>),
      ...(stream.user_agent ? { "User-Agent": stream.user_agent as string } : {}),
      ...(stream.referer ? { Referer: stream.referer as string } : {})
    };
    const alive = await headProbe(stream.stream_url as string, headers, appConfig.streamProbeTimeoutMs);

    if (alive) {
      return buildStreamResponse(
        channel.name as string,
        String(stream.source_id),
        stream.stream_url as string,
        sanitizeHeaders(headers)
      );
    }
  }

  if (config.streamValidation === "strict") {
    return { streams: [] };
  }

  const fallback = streams[0];
  if (!fallback) {
    return { streams: [] };
  }

  const headers = {
    ...(fallback.http_headers as Record<string, string>),
    ...(fallback.user_agent ? { "User-Agent": fallback.user_agent as string } : {}),
    ...(fallback.referer ? { Referer: fallback.referer as string } : {})
  };

  return buildStreamResponse(
    channel.name as string,
    String(fallback.source_id),
    fallback.stream_url as string,
    sanitizeHeaders(headers),
    "fallback"
  );
}
