import { supabase } from "../db/supabase.js";
import { logger } from "../lib/logger.js";
const searchable = (channel) => [channel.name, channel.groupTitle, channel.sourceId, ...channel.aliases].filter(Boolean).join(" ");
const dedupeBy = (items, keyFn) => {
    const seen = new Set();
    return items.filter((item) => {
        const key = keyFn(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};
const consolidateChannels = (channels) => {
    const merged = new Map();
    for (const channel of channels) {
        const existing = merged.get(channel.stremioId);
        if (!existing) {
            merged.set(channel.stremioId, {
                ...channel,
                aliases: dedupeBy(channel.aliases, (alias) => alias),
                streams: dedupeBy(channel.streams.map((stream) => ({ ...stream })), (stream) => `${stream.sourceId}:${stream.streamUrl}`)
            });
            continue;
        }
        merged.set(channel.stremioId, {
            ...existing,
            name: existing.name || channel.name,
            tvgId: existing.tvgId || channel.tvgId,
            tvgName: existing.tvgName || channel.tvgName,
            tvgLogo: existing.tvgLogo || channel.tvgLogo,
            groupTitle: existing.groupTitle || channel.groupTitle,
            region: existing.region || channel.region,
            countryCode: existing.countryCode || channel.countryCode,
            language: existing.language || channel.language,
            quality: existing.quality || channel.quality,
            website: existing.website || channel.website,
            description: existing.description || channel.description,
            metadata: {
                ...existing.metadata,
                ...channel.metadata
            },
            aliases: dedupeBy([...existing.aliases, ...channel.aliases], (alias) => alias),
            streams: dedupeBy([...existing.streams, ...channel.streams.map((stream) => ({ ...stream }))], (stream) => `${stream.sourceId}:${stream.streamUrl}`)
        });
    }
    return Array.from(merged.values());
};
export async function persistProviderResult(result) {
    if (!supabase) {
        logger.warn("Skipping persistence because Supabase is not configured", { provider: result.source.id });
        return;
    }
    const { error: sourceError } = await supabase.from("sources").upsert({
        id: result.source.id,
        name: result.source.name,
        priority: result.source.priority,
        base_region: result.source.baseRegion,
        last_ingested_at: new Date().toISOString(),
        status: "success",
        metadata: result.source.metadata ?? {}
    });
    if (sourceError) {
        throw sourceError;
    }
    const consolidatedChannels = consolidateChannels(result.channels);
    const channelRows = consolidatedChannels.map((channel) => ({
        stremio_id: channel.stremioId,
        canonical_slug: channel.canonicalSlug,
        name: channel.name,
        tvg_id: channel.tvgId,
        tvg_name: channel.tvgName,
        tvg_logo: channel.tvgLogo,
        group_title: channel.groupTitle,
        source_id: channel.sourceId,
        region: channel.region,
        country_code: channel.countryCode,
        language: channel.language,
        is_geo_blocked: channel.isGeoBlocked,
        quality: channel.quality,
        website: channel.website,
        description: channel.description,
        metadata: channel.metadata,
        searchable: searchable(channel),
        updated_at: new Date().toISOString()
    }));
    const { data: upsertedChannels, error: channelError } = await supabase
        .from("channels")
        .upsert(channelRows, { onConflict: "stremio_id" })
        .select("id, stremio_id, tvg_id, tvg_name, name, canonical_slug");
    if (channelError) {
        throw channelError;
    }
    const channelByStremioId = new Map((upsertedChannels ?? []).map((row) => [row.stremio_id, row.id]));
    const channelByXmltv = new Map();
    for (const row of upsertedChannels ?? []) {
        const keys = [row.tvg_id, row.tvg_name, row.name, row.canonical_slug].filter(Boolean);
        for (const key of keys) {
            channelByXmltv.set(key, row.id);
        }
    }
    const streamRows = consolidatedChannels.flatMap((channel) => {
        const channelId = channelByStremioId.get(channel.stremioId);
        if (!channelId) {
            return [];
        }
        return channel.streams.map((stream) => ({
            channel_id: channelId,
            source_id: stream.sourceId,
            stream_url: stream.streamUrl,
            backup_stream_url: stream.backupStreamUrl,
            referer: stream.referer,
            user_agent: stream.userAgent,
            http_headers: stream.headers,
            quality: stream.quality,
            priority: stream.priority,
            is_active: true,
            last_checked_at: null
        }));
    });
    const dedupedStreamRows = dedupeBy(streamRows, (row) => `${row.channel_id}:${row.source_id}:${row.stream_url}`);
    if (dedupedStreamRows.length) {
        const { error } = await supabase.from("channel_streams").upsert(dedupedStreamRows, {
            onConflict: "channel_id,source_id,stream_url"
        });
        if (error) {
            throw error;
        }
    }
    const programmeRows = result.programmes.flatMap((programme) => {
        const channelId = channelByXmltv.get(programme.channelKey);
        if (!channelId) {
            return [];
        }
        return [{
                channel_id: channelId,
                xmltv_channel_id: programme.xmltvChannelId,
                title: programme.title,
                subtitle: programme.subtitle,
                description: programme.description,
                category: programme.category,
                start_at: programme.startAt,
                end_at: programme.endAt,
                episode_num: programme.episodeNum
            }];
    });
    if (programmeRows.length) {
        const { error } = await supabase.from("programmes").upsert(programmeRows, {
            onConflict: "channel_id,start_at,end_at,title"
        });
        if (error) {
            throw error;
        }
    }
    await supabase.from("ingestion_runs").insert({
        source_id: result.source.id,
        status: "success",
        channels_seen: consolidatedChannels.length,
        programmes_seen: programmeRows.length,
        stats: { feeds: result.feeds }
    });
}
