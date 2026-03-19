import express from "express";
import cors from "cors";
import path from "node:path";
import { appConfig } from "../lib/config.js";
import { createAddonInterface } from "../addon/router.js";
import { proxyStream } from "./proxy.js";
import { renderConfigPage } from "../ui/config/page.js";
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use("/assets", express.static(path.resolve("src/ui/assets")));
    app.get("/", (_req, res) => {
        res.type("html").send(renderConfigPage());
    });
    app.get("/health", (_req, res) => {
        res.json({ ok: true });
    });
    app.get("/proxy", proxyStream);
    app.get("/:configToken/manifest.json", async (req, res, next) => {
        try {
            const addon = createAddonInterface(appConfig.baseUrl, req.params.configToken);
            res.json(await addon.getManifest());
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/manifest.json", async (_req, res, next) => {
        try {
            const addon = createAddonInterface(appConfig.baseUrl);
            res.json(await addon.getManifest());
        }
        catch (error) {
            next(error);
        }
    });
    const defaultAddon = createAddonInterface(appConfig.baseUrl);
    app.use(defaultAddon.getRouter());
    app.use("/:configToken", (req, res, next) => {
        const addon = createAddonInterface(appConfig.baseUrl, req.params.configToken);
        return addon.getRouter()(req, res, next);
    });
    app.use((error, _req, res, _next) => {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        });
    });
    return app;
}
