declare module "stremio-addon-sdk" {
  const sdk: {
    addonBuilder: new (manifest: Record<string, unknown>) => {
      defineCatalogHandler(handler: (args: any) => any): void;
      defineMetaHandler(handler: (args: any) => any): void;
      defineStreamHandler(handler: (args: any) => any): void;
      getInterface(): any;
    };
    getRouter(addonInterface: any): any;
    serveHTTP(addonInterface: any, options?: Record<string, unknown>): any;
  };

  export default sdk;
  export const addonBuilder: new (manifest: Record<string, unknown>) => {
    defineCatalogHandler(handler: (args: any) => any): void;
    defineMetaHandler(handler: (args: any) => any): void;
    defineStreamHandler(handler: (args: any) => any): void;
    getInterface(): any;
  };

  export function getRouter(addonInterface: any): any;
  export function serveHTTP(addonInterface: any, options?: Record<string, unknown>): any;
}
