const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

export const makeCanonicalSlug = (...parts: Array<string | null | undefined>) =>
  slugify(parts.filter(Boolean).join("-"));

export const makeStremioId = (slug: string) => `mhtv:channel:${slug}`;

export const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");
