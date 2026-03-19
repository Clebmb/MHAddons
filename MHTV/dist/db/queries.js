import { supabase } from "./supabase.js";
import { getCatalogSources } from "../addon/manifest.js";
const applyChannelFilters = (query, config) => {
    const catalogSources = getCatalogSources(config);
    if (catalogSources.length) {
        query = query.in("channel_streams.source_id", catalogSources);
    }
    if (config.regions.length) {
        query = query.in("region", config.regions);
    }
    if (config.includeGroups.length) {
        query = query.in("group_title", config.includeGroups);
    }
    if (config.excludeGroups.length) {
        query = query.not("group_title", "in", `(${config.excludeGroups.map((group) => `"${group}"`).join(",")})`);
    }
    return query;
};
export async function listCatalogGroups(config) {
    if (!supabase) {
        return [];
    }
    let query = supabase
        .from("channels")
        .select("group_title, channel_streams!inner(source_id)")
        .order("group_title");
    query = applyChannelFilters(query, config);
    const { data, error } = await query;
    if (error) {
        throw error;
    }
    return [...new Set((data ?? []).map((row) => row.group_title))];
}
export async function searchChannels(config, search, groupTitle) {
    if (!supabase) {
        return [];
    }
    let query = supabase
        .from("channels")
        .select("*, channel_streams!inner(source_id)")
        .order("name")
        .limit(200);
    query = applyChannelFilters(query, config);
    if (groupTitle) {
        query = query.eq("group_title", groupTitle);
    }
    if (search) {
        query = query.or(`name.ilike.%${search}%,searchable.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) {
        throw error;
    }
    return Array.from(new Map((data ?? []).map((row) => [row.stremio_id, row])).values());
}
export async function getChannelByStremioId(stremioId) {
    if (!supabase) {
        return null;
    }
    const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("stremio_id", stremioId)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
export async function getProgrammesForChannel(channelId, nowIso) {
    if (!supabase) {
        return { current: null, next: null };
    }
    const { data, error } = await supabase
        .from("programmes")
        .select("*")
        .eq("channel_id", channelId)
        .gte("end_at", nowIso)
        .order("start_at")
        .limit(2);
    if (error) {
        throw error;
    }
    return {
        current: data?.[0] ?? null,
        next: data?.[1] ?? null
    };
}
export async function getStreamsForChannel(channelId, sourceOrder) {
    if (!supabase) {
        return [];
    }
    const { data, error } = await supabase
        .from("channel_streams")
        .select("*")
        .eq("channel_id", channelId)
        .eq("is_active", true)
        .order("priority");
    if (error) {
        throw error;
    }
    const filtered = (data ?? []).filter((row) => {
        const sourceId = row.source_id;
        return sourceOrder.includes(sourceId);
    });
    const ordered = filtered.sort((left, right) => {
        const sourceDelta = sourceOrder.indexOf(left.source_id) - sourceOrder.indexOf(right.source_id);
        return sourceDelta !== 0 ? sourceDelta : Number(left.priority) - Number(right.priority);
    });
    return ordered;
}
