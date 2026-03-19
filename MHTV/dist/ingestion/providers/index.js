import { MjhProvider } from "./mjh.js";
import { TvappProvider } from "./tvapp.js";
export function getProviders() {
    return [new TvappProvider(), new MjhProvider()];
}
