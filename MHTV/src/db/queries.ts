import { supabase } from "./supabase.js";
import type { AddonConfig } from "../lib/types.js";
import { getCatalogSources } from "../addon/manifest.js";

const applyChannelFilters = (query: any, config: AddonConfig) => {
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
    query = query.not(
      "group_title",
      "in",
      `(${config.excludeGroups.map((group) => `"${group}"`).join(",")})`
    );
  }

  return query;
};

export async function listCatalogGroups(config: AddonConfig) {
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

  return [...new Set((data ?? []).map((row) => row.group_title as string))];
}

export async function searchChannels(config: AddonConfig, search?: string, groupTitle?: string) {
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

  return Array.from(new Map((data ?? []).map((row) => [row.stremio_id as string, row])).values());
}

export async function getChannelByStremioId(stremioId: string) {
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

export async function getProgrammesForChannel(channelId: string, nowIso: string) {
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

export async function getStreamsForChannel(channelId: string, sourceOrder: string[]) {
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
    const sourceId = row.source_id as string;
    return sourceOrder.includes(sourceId);
  });

  const ordered = filtered.sort((left, right) => {
    const sourceDelta =
      sourceOrder.indexOf(left.source_id as string) - sourceOrder.indexOf(right.source_id as string);
    return sourceDelta !== 0 ? sourceDelta : Number(left.priority) - Number(right.priority);
  });

  return ordered;
}
