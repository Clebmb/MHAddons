import dotenv from "dotenv";
import path from "node:path";
dotenv.config();
const splitCsv = (value) => (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
const defaultMjhProviderUrls = [
    "https://i.mjh.nz/all/raw-tv.m3u8",
    "https://i.mjh.nz/world/raw-tv.m3u8",
    "https://i.mjh.nz/nz/raw-tv.m3u8",
    "https://i.mjh.nz/nzau/raw-tv.m3u8"
];
const defaultMjhEpgUrls = [
    "https://i.mjh.nz/all/epg.xml",
    "https://i.mjh.nz/world/epg.xml",
    "https://i.mjh.nz/nz/epg.xml",
    "https://i.mjh.nz/nzau/epg.xml"
];
export const appConfig = {
    port: Number(process.env.PORT ?? 7000),
    baseUrl: process.env.BASE_URL ?? "http://localhost:7000",
    ingestCron: process.env.INGEST_CRON ?? "0 */6 * * *",
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    supabaseSchema: process.env.SUPABASE_SCHEMA ?? "public",
    streamProbeTimeoutMs: Number(process.env.STREAM_PROBE_TIMEOUT_MS ?? 1000),
    userAgent: process.env.USER_AGENT ?? "MHTV/0.1",
    proxyReferer: process.env.PROXY_REFERER ?? "https://i.mjh.nz/",
    tvappBaseUrl: process.env.TVAPP_BASE_URL ?? "http://tvapp:4124",
    tvappHealthUrl: process.env.TVAPP_HEALTH_URL ?? "http://tvapp:4124/api/health",
    tvappM3uPath: process.env.TVAPP_M3U_PATH ?? path.resolve("shared/tvapp/playlist.m3u8"),
    tvappXmltvPath: process.env.TVAPP_XMLTV_PATH ?? path.resolve("shared/tvapp/xmltv.xml"),
    mjhProviderUrls: splitCsv(process.env.MJH_PROVIDER_URLS).length
        ? splitCsv(process.env.MJH_PROVIDER_URLS)
        : defaultMjhProviderUrls,
    mjhEpgUrls: splitCsv(process.env.MJH_EPG_URLS).length ? splitCsv(process.env.MJH_EPG_URLS) : defaultMjhEpgUrls
};
export const isSupabaseConfigured = Boolean(appConfig.supabaseUrl) && Boolean(appConfig.supabaseServiceRoleKey);
