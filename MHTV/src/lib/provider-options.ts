export const SOURCE_FAMILY_HEADER = "X-MHTV-Source-Family";

export const knownMjhFamilyOptions = [
  { id: "binge", label: "Binge" },
  { id: "dstv", label: "DStv" },
  { id: "flash", label: "Flash" },
  { id: "foxtel", label: "Foxtel" },
  { id: "kayo", label: "Kayo" },
  { id: "metv", label: "MeTV" },
  { id: "pbs", label: "PBS" },
  { id: "plex", label: "Plex" },
  { id: "plutotv", label: "PlutoTV" },
  { id: "roku", label: "Roku" },
  { id: "samsungtvplus", label: "SamsungTVPlus" },
  { id: "singtel", label: "Singtel" },
  { id: "skygo", label: "SkyGo" },
  { id: "skysportnow", label: "SkySportNow" },
  { id: "all", label: "all" },
  { id: "au", label: "au" },
  { id: "frndly_tv", label: "frndly_tv" },
  { id: "hgtv_go", label: "hgtv_go" },
  { id: "nz", label: "nz" },
  { id: "nzau", label: "nzau" },
  { id: "world", label: "world" }
] as const;

const toTitleCase = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (match) => match.toUpperCase());

export function inferMjhFamilyLabel(url: string) {
  try {
    const pathname = new URL(url).pathname.split("/").filter(Boolean);
    return pathname[0] ? toTitleCase(pathname[0]) : "General";
  } catch {
    return "General";
  }
}

export function inferMjhFamilyId(url: string) {
  return inferMjhFamilyLabel(url).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function listMjhFamilyOptions(urls: string[]) {
  return Array.from(
    new Map(
      urls.map((url) => {
        const id = inferMjhFamilyId(url);
        return [id, { id, label: inferMjhFamilyLabel(url) }];
      })
    ).values()
  );
}

export function inferTvappSourceFamily(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("tvpass")) {
      return "tvpass";
    }
    if (hostname.includes("moveonjoy")) {
      return "moveonjoy";
    }
    return "thetvapp";
  } catch {
    return "thetvapp";
  }
}
