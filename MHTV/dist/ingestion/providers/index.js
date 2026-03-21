import { hasKptvProvider, hasM3uProvider, hasXtreamProvider } from "../../lib/provider-config.js";
import { KptvProvider } from "./kptv.js";
import { MjhProvider } from "./mjh.js";
import { M3uProvider } from "./m3u.js";
import { TvappProvider } from "./tvapp.js";
import { XtreamProvider } from "./xtream.js";
export function getProviders() {
    const providers = [new TvappProvider(), new MjhProvider()];
    if (hasKptvProvider()) {
        providers.push(new KptvProvider());
    }
    if (hasXtreamProvider()) {
        providers.push(new XtreamProvider());
    }
    if (hasM3uProvider()) {
        providers.push(new M3uProvider());
    }
    return providers;
}
