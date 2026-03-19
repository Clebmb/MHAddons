import { searchChannels } from "../db/queries.js";
export async function buildCatalog(type, id, extra, config) {
    if (type !== "tv") {
        return { metas: [] };
    }
    const groupTitle = id.startsWith("group:") ? decodeURIComponent(id.replace(/^group:/, "")) : undefined;
    const channels = await searchChannels(config, extra.search, groupTitle);
    return {
        metas: channels.map((channel) => ({
            id: channel.stremio_id,
            type: "tv",
            name: channel.name,
            poster: channel.tvg_logo,
            posterShape: "square",
            description: `${channel.group_title} | ${channel.region ?? "global"}`
        }))
    };
}
