import assert from "node:assert/strict";
import { decodeConfig, encodeConfig } from "../dist/ui/config/state.js";
import { parseM3U } from "../dist/ingestion/parsers/m3u.js";
import { listMjhFamilyOptions } from "../dist/lib/provider-options.js";
import { appConfig } from "../dist/lib/config.js";

const mjhFamilies = listMjhFamilyOptions(appConfig.mjhProviderUrls).map((option) => option.id);

const roundTripValue = {
  sources: ["tvapp"],
  regions: ["us", "uk"],
  resolution: "prefer_hd",
  streamValidation: "balanced",
  catalogLayout: "grouped",
  kptvMode: "both",
  tvappMode: "both",
  mjhMode: "streams_only",
  xtreamMode: "both",
  m3uMode: "both",
  tvappSourceFamilies: ["thetvapp", "tvpass"],
  mjhFeedFamilies: mjhFamilies,
  includeGroups: ["News"],
  excludeGroups: ["Adult"]
};

assert.deepEqual(decodeConfig(encodeConfig(roundTripValue)), roundTripValue);

const parsed = parseM3U(
  "mjh",
  "#EXTM3U\n#EXTINF:-1 tvg-id=\"cnn.us\" tvg-name=\"CNN\" tvg-logo=\"https://img\" group-title=\"News\",CNN\nhttps://example.com/cnn.m3u8"
);

assert.equal(parsed.length, 1);
assert.equal(parsed[0].name, "CNN");
assert.equal(parsed[0].groupTitle, "News");
assert.equal(parsed[0].streams[0].streamUrl, "https://example.com/cnn.m3u8");

console.log("Tests passed");
