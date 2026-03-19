import sdk from "stremio-addon-sdk";
import { listCatalogGroups } from "../db/queries.js";
import { decodeConfig } from "../ui/config/state.js";
import { buildCatalog } from "./catalogs.js";
import { buildManifest } from "./manifest.js";
import { buildMeta } from "./meta.js";
import { buildStreams } from "./streams.js";

const { addonBuilder, getRouter } = sdk;

interface CatalogArgs {
  type: string;
  id: string;
  extra?: Record<string, string>;
}

interface ResourceArgs {
  type: string;
  id: string;
}

export function createAddonInterface(baseUrl: string, configToken?: string) {
  const config = decodeConfig(configToken);
  const builder = new addonBuilder({
    id: "org.mediahoard.mhtv",
    version: "0.1.0",
    name: "MHTV",
    description: "MediaHoard IPTV aggregation addon",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["mhtv:channel:"],
    catalogs: []
  });

  builder.defineCatalogHandler(async ({ type, id, extra }: CatalogArgs) =>
    buildCatalog(type, id, extra ?? {}, config)
  );
  builder.defineMetaHandler(async ({ type, id }: ResourceArgs) => buildMeta(type, id));
  builder.defineStreamHandler(async ({ type, id }: ResourceArgs) => buildStreams(type, id, config));

  return {
    getRouter() {
      return getRouter(builder.getInterface());
    },
    async getManifest() {
      const groups = await listCatalogGroups(config);
      return buildManifest(baseUrl, configToken ?? "", groups, config);
    }
  };
}
