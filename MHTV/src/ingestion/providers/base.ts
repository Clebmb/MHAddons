import type { Provider } from "../../lib/types.js";

export abstract class BaseProvider implements Provider {
  abstract id: string;
  abstract displayName: string;
  abstract priority: number;

  abstract ingest(): ReturnType<Provider["ingest"]>;
}
