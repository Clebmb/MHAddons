import { getChannelByStremioId, getProgrammesForChannel } from "../db/queries.js";
export async function buildMeta(type, id) {
    if (type !== "tv") {
        return { meta: null };
    }
    const channel = await getChannelByStremioId(id);
    if (!channel) {
        return { meta: null };
    }
    const now = new Date().toISOString();
    const { current, next } = await getProgrammesForChannel(channel.id, now);
    const currentLine = current
        ? `Now Playing: ${current.title}${current.description ? ` - ${current.description}` : ""}`
        : "Now Playing: Unknown";
    const nextLine = next ? `Up Next: ${next.title}` : "Up Next: Unknown";
    return {
        meta: {
            id: channel.stremio_id,
            type: "tv",
            name: channel.name,
            poster: channel.tvg_logo,
            background: channel.tvg_logo,
            description: `${currentLine}\n${nextLine}`,
            genres: [channel.group_title],
            releaseInfo: channel.region ?? "global"
        }
    };
}
