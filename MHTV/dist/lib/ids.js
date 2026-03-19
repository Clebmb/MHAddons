const slugify = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
export const makeCanonicalSlug = (...parts) => slugify(parts.filter(Boolean).join("-"));
export const makeStremioId = (slug) => `mhtv:channel:${slug}`;
export const normalizeText = (value) => value.trim().replace(/\s+/g, " ");
