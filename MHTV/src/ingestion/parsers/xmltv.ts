import { XMLParser } from "fast-xml-parser";
import type { NormalizedProgramme } from "../../lib/types.js";
import { normalizeText } from "../../lib/ids.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "value"
});

const arrayWrap = <T>(value: T | T[] | undefined): T[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

const xmltvToIso = (value: string) => {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?$/);
  if (!match) {
    return new Date(value).toISOString();
  }

  const [, year, month, day, hour, minute, second] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
};

export function parseXmltv(content: string): NormalizedProgramme[] {
  const parsed = parser.parse(content) as {
    tv?: {
      programme?: Array<Record<string, unknown>> | Record<string, unknown>;
    };
  };

  return arrayWrap(parsed.tv?.programme).map((programme) => {
    const titleNode = arrayWrap(programme.title as Record<string, unknown> | undefined)[0] as any;
    const subtitleNode = arrayWrap(programme["sub-title"] as Record<string, unknown> | undefined)[0] as any;
    const descNode = arrayWrap(programme.desc as Record<string, unknown> | undefined)[0] as any;
    const categoryNodes = arrayWrap(programme.category as Array<Record<string, unknown>> | Record<string, unknown>) as any[];

    return {
      channelKey: String(programme.channel ?? ""),
      xmltvChannelId: String(programme.channel ?? ""),
      title: normalizeText(String(titleNode?.value ?? titleNode ?? "Unknown Programme")),
      subtitle: subtitleNode ? normalizeText(String(subtitleNode.value ?? subtitleNode)) : null,
      description: descNode ? normalizeText(String(descNode.value ?? descNode)) : null,
      category: categoryNodes.map((node) => normalizeText(String(node.value ?? node))),
      startAt: xmltvToIso(String(programme.start)),
      endAt: xmltvToIso(String(programme.stop)),
      episodeNum: programme["episode-num"] ? String(programme["episode-num"]) : null
    };
  });
}
