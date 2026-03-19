import type { Provider } from "../../lib/types.js";
import { MjhProvider } from "./mjh.js";
import { TvappProvider } from "./tvapp.js";

export function getProviders(): Provider[] {
  return [new TvappProvider(), new MjhProvider()];
}
