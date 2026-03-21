import fs from "node:fs";
import path from "node:path";
import { appConfig } from "./config.js";
const providerConfigPath = process.env.PROVIDER_CONFIG_PATH ?? path.resolve("data/provider-config.json");
const defaultProviderConfig = () => ({
    kptvBaseUrl: appConfig.kptvBaseUrl,
    kptvRegion: appConfig.kptvRegion || "global",
    xtreamBaseUrl: appConfig.xtreamBaseUrl,
    xtreamUsername: appConfig.xtreamUsername,
    xtreamPassword: appConfig.xtreamPassword,
    xtreamRegion: appConfig.xtreamRegion || "global",
    xtreamXmltvUrl: appConfig.xtreamXmltvUrl,
    m3uProviderUrls: [...appConfig.m3uProviderUrls],
    m3uEpgUrls: [...appConfig.m3uEpgUrls],
    m3uRegion: appConfig.m3uRegion || "global"
});
const normalizeStringArray = (value) => Array.isArray(value)
    ? value.map((entry) => String(entry).trim()).filter(Boolean)
    : String(value ?? "")
        .split(/\r?\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean);
export function loadProviderConfig() {
    const fallback = defaultProviderConfig();
    if (!fs.existsSync(providerConfigPath)) {
        return fallback;
    }
    try {
        const raw = JSON.parse(fs.readFileSync(providerConfigPath, "utf8"));
        return {
            kptvBaseUrl: String(raw.kptvBaseUrl ?? fallback.kptvBaseUrl).trim(),
            kptvRegion: String(raw.kptvRegion ?? fallback.kptvRegion ?? "global").trim() || "global",
            xtreamBaseUrl: String(raw.xtreamBaseUrl ?? fallback.xtreamBaseUrl).trim(),
            xtreamUsername: String(raw.xtreamUsername ?? fallback.xtreamUsername).trim(),
            xtreamPassword: String(raw.xtreamPassword ?? fallback.xtreamPassword),
            xtreamRegion: String(raw.xtreamRegion ?? fallback.xtreamRegion ?? "global").trim() || "global",
            xtreamXmltvUrl: String(raw.xtreamXmltvUrl ?? fallback.xtreamXmltvUrl).trim(),
            m3uProviderUrls: normalizeStringArray(raw.m3uProviderUrls ?? fallback.m3uProviderUrls),
            m3uEpgUrls: normalizeStringArray(raw.m3uEpgUrls ?? fallback.m3uEpgUrls),
            m3uRegion: String(raw.m3uRegion ?? fallback.m3uRegion ?? "global").trim() || "global"
        };
    }
    catch {
        return fallback;
    }
}
export function saveProviderConfig(nextConfig) {
    const current = loadProviderConfig();
    const normalized = {
        kptvBaseUrl: String(nextConfig.kptvBaseUrl ?? current.kptvBaseUrl).trim(),
        kptvRegion: String(nextConfig.kptvRegion ?? current.kptvRegion ?? "global").trim() || "global",
        xtreamBaseUrl: String(nextConfig.xtreamBaseUrl ?? current.xtreamBaseUrl).trim(),
        xtreamUsername: String(nextConfig.xtreamUsername ?? current.xtreamUsername).trim(),
        xtreamPassword: String(nextConfig.xtreamPassword ?? current.xtreamPassword),
        xtreamRegion: String(nextConfig.xtreamRegion ?? current.xtreamRegion ?? "global").trim() || "global",
        xtreamXmltvUrl: String(nextConfig.xtreamXmltvUrl ?? current.xtreamXmltvUrl).trim(),
        m3uProviderUrls: normalizeStringArray(nextConfig.m3uProviderUrls ?? current.m3uProviderUrls),
        m3uEpgUrls: normalizeStringArray(nextConfig.m3uEpgUrls ?? current.m3uEpgUrls),
        m3uRegion: String(nextConfig.m3uRegion ?? current.m3uRegion ?? "global").trim() || "global"
    };
    fs.mkdirSync(path.dirname(providerConfigPath), { recursive: true });
    fs.writeFileSync(providerConfigPath, JSON.stringify(normalized, null, 2), "utf8");
    return normalized;
}
export function hasXtreamProvider(config = loadProviderConfig()) {
    return Boolean(config.xtreamBaseUrl && config.xtreamUsername && config.xtreamPassword);
}
export function hasM3uProvider(config = loadProviderConfig()) {
    return config.m3uProviderUrls.length > 0;
}
export function hasKptvProvider(config = loadProviderConfig()) {
    return Boolean(config.kptvBaseUrl);
}
