import { encodeConfig, getDefaultConfig } from "./state.js";
import { appConfig } from "../../lib/config.js";
import { knownMjhFamilyOptions } from "../../lib/provider-options.js";
import { hasKptvProvider, hasM3uProvider, hasXtreamProvider, loadProviderConfig } from "../../lib/provider-config.js";

const mjhFamilyOptions = knownMjhFamilyOptions;
const tvappFamilyOptions = [
  { id: "thetvapp", label: "TheTVApp" },
  { id: "tvpass", label: "TVPass" },
  { id: "moveonjoy", label: "MoveOnJoy" }
] as const;

const providerCards = [
  {
    id: "tvapp",
    title: "TVApp2",
    icon: "live_tv",
    description: "Local TVApp2 lineup with guide data and fast failover for US channels.",
    badges: ["Local lineup", "US-first"]
  },
  {
    id: "mjh",
    title: "i.mjh.nz",
    icon: "satellite_alt",
    description: "Broad regional playlists and XMLTV feeds pulled from i.mjh.nz.",
    badges: ["Regional feeds", "Remote playlist"]
  },
  {
    id: "kptv",
    title: "KPTV FAST",
    icon: "hub",
    description: "Unified FAST playlist and EPG from 20+ upstream free TV providers via kptv-fast.",
    badges: ["FAST bundle", "Playlist + EPG"]
  },
  {
    id: "xtream",
    title: "Xtream Codes",
    icon: "router",
    description: "Xtream live channel API ingested from a configured IPTV server.",
    badges: ["Account-based", "Live categories"]
  },
  {
    id: "m3u",
    title: "Custom M3U",
    icon: "playlist_play",
    description: "Direct remote M3U playlists with optional XMLTV guide data.",
    badges: ["Playlist ingest", "Optional EPG"]
  }
] as const;

const regionOptions = [
  ["us", "United States"],
  ["uk", "United Kingdom"],
  ["ca", "Canada"],
  ["au", "Australia"],
  ["nz", "New Zealand"],
  ["global", "Global"]
] as const;

const crossAddonLinks = [
  { label: "MHStreams", port: 3000 },
  { label: "MHMetadata", port: 5173 }
] as const;

const renderProviderCards = () =>
  providerCards
    .map(
      (provider, index) => `
        <article class="glass-card provider-card" data-provider="${provider.id}">
          <div class="provider-header">
            <div class="feature-icon"><span class="material-symbols-outlined">${provider.icon}</span></div>
            <div>
              <h3>${provider.title}</h3>
              <p>${provider.description}</p>
            </div>
          </div>
          <div class="stack">
            <label class="switch-row">
              <span>Enable provider</span>
              <input type="checkbox" name="source" value="${provider.id}" ${provider.id === "kptv" ? (hasKptvProvider(loadProviderConfig()) ? "checked" : "") : provider.id === "xtream" ? (hasXtreamProvider(loadProviderConfig()) ? "checked" : "") : provider.id === "m3u" ? (hasM3uProvider(loadProviderConfig()) ? "checked" : "") : "checked"} />
            </label>
            <div class="subsection">
              <p class="eyebrow">Priority</p>
              <div class="chip-row">
                <label class="choice-chip">
                  <input type="radio" name="${provider.id}-priority" value="primary" ${index === 0 ? "checked" : ""} />
                  <span>Primary</span>
                </label>
                <label class="choice-chip">
                  <input type="radio" name="${provider.id}-priority" value="secondary" ${index !== 0 ? "checked" : ""} />
                  <span>Secondary</span>
                </label>
              </div>
            </div>
            <div class="subsection">
              <p class="eyebrow">Provider Mode</p>
              <label class="field">
                <span>How this provider participates</span>
                <select id="${provider.id}-mode">
                  <option value="both">Catalogs and streams</option>
                  <option value="catalog_only">Catalogs only</option>
                  <option value="streams_only">Streams only</option>
                </select>
              </label>
            </div>
            <div class="subsection">
              <p class="eyebrow">Specific Source Notes</p>
              <div class="pill-list">
                ${provider.badges.map((badge) => `<span class="pill">${badge}</span>`).join("")}
              </div>
              ${
                provider.id === "tvapp"
                  ? `<p class="helper-text">Best for US channel naming and local TVApp2 parity.</p>
                    <div class="family-grid">
                      ${tvappFamilyOptions
                        .map(
                          (option) => `
                            <label class="selection-row glass-card family-option">
                              <span>${option.label}</span>
                              <input type="checkbox" name="tvapp-family" value="${option.id}" checked />
                            </label>
                          `
                        )
                        .join("")}
                    </div>`
                  : provider.id === "mjh"
                  ? `<p class="helper-text">Best for broader regional coverage and backup playlists.</p>
                    ${
                      mjhFamilyOptions.length
                        ? `<div class="family-grid">
                            ${mjhFamilyOptions
                              .map(
                                (option) => `
                                  <label class="selection-row glass-card family-option">
                                    <span>${option.label}</span>
                                    <input type="checkbox" name="mjh-family" value="${option.id}" checked />
                                  </label>
                                `
                              )
                              .join("")}
                          </div>`
                        : `<p class="helper-text">No i.mjh.nz source directories are currently available.</p>`
                    }`
                  : provider.id === "kptv"
                  ? `<p class="helper-text">Consumes kptv-fast's <code>/playlist</code> and <code>/epg</code>, which bundle Pluto, Plex, Samsung, Tubi, Xumo, LG, Stirr, Roku, Whale, and more into one upstream source.</p>
                    <div class="setup-grid">
                      <label class="field field-full"><span>KPTV Base URL</span><input id="kptv-base-url" type="text" value="${loadProviderConfig().kptvBaseUrl}" placeholder="http://kptv-fast:8080" /></label>
                      <label class="field"><span>Region</span><input id="kptv-region" type="text" value="${loadProviderConfig().kptvRegion}" placeholder="global" /></label>
                    </div>`
                  : provider.id === "xtream"
                  ? `<p class="helper-text">Uses PlayTorrio-style Xtream login flow, but keeps credentials on the MHTV server instead of inside the manifest URL.</p>
                    <div class="setup-grid">
                      <label class="field"><span>Server URL</span><input id="xtream-base-url" type="text" value="${loadProviderConfig().xtreamBaseUrl}" placeholder="http://server:8080" /></label>
                      <label class="field"><span>Username</span><input id="xtream-username" type="text" value="${loadProviderConfig().xtreamUsername}" placeholder="username" /></label>
                      <label class="field"><span>Password</span><input id="xtream-password" type="password" value="${loadProviderConfig().xtreamPassword}" placeholder="password" /></label>
                      <label class="field"><span>Region</span><input id="xtream-region" type="text" value="${loadProviderConfig().xtreamRegion}" placeholder="global" /></label>
                      <label class="field field-full"><span>XMLTV URL Override</span><input id="xtream-xmltv-url" type="text" value="${loadProviderConfig().xtreamXmltvUrl}" placeholder="Optional custom XMLTV URL" /></label>
                    </div>`
                  : `<p class="helper-text">Uses PlayTorrio-style direct M3U playlist mode, but stores the playlist URLs on the MHTV server.</p>
                    <div class="setup-grid">
                      <label class="field field-full"><span>M3U URLs</span><textarea id="m3u-provider-urls" rows="4" placeholder="One URL per line">${loadProviderConfig().m3uProviderUrls.join("\n")}</textarea></label>
                      <label class="field field-full"><span>XMLTV URLs</span><textarea id="m3u-epg-urls" rows="3" placeholder="Optional, one URL per line">${loadProviderConfig().m3uEpgUrls.join("\n")}</textarea></label>
                      <label class="field"><span>Region</span><input id="m3u-region" type="text" value="${loadProviderConfig().m3uRegion}" placeholder="global" /></label>
                    </div>`
              }
            </div>
          </div>
        </article>
      `
    )
    .join("");

const renderRegionOptions = () =>
  regionOptions
    .map(
      ([value, label]) => `
        <label class="selection-row glass-card">
          <span>${label}</span>
          <input type="checkbox" name="region" value="${value}" />
        </label>
      `
    )
    .join("");

export function renderConfigPage() {
  const defaults = getDefaultConfig();
  const manifestUrl = `${appConfig.baseUrl}/${encodeConfig(defaults)}/manifest.json`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MHTV</title>
  <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/style.css" />
</head>
<body>
  <div class="app-shell">
    <div class="mobile-header">
      <button class="mobile-menu-btn" id="menu-toggle" type="button">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <div class="logo-text">MH<span>TV</span></div>
      <span class="mobile-spacer"></span>
    </div>
    <div class="overlay" id="nav-overlay"></div>
    <div class="overlay modal-overlay" id="url-modal-overlay"></div>
    <aside id="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg class="logo-play" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5.5L18 12L7 18.5V5.5Z" />
            </svg>
          </div>
          <div>
            <div class="logo-text">MH<span>TV</span></div>
          </div>
        </div>
      </div>
      <nav>
        <button class="nav-item active" data-page="home" type="button"><span class="material-symbols-outlined">home</span>Home</button>
        <button class="nav-item" data-page="configuration" type="button"><span class="material-symbols-outlined">tune</span>Configuration</button>
        <button class="nav-item" data-page="providers" type="button"><span class="material-symbols-outlined">dns</span>Providers</button>
        <button class="nav-item" data-page="regions" type="button"><span class="material-symbols-outlined">public</span>Regions</button>
      </nav>
      <div class="sidebar-footer">
        <div class="cross-links">
          <p class="sidebar-section-label">Other Addons</p>
          ${crossAddonLinks
            .map(
              (link) => `
                <a class="btn btn-outline cross-link" data-port="${link.port}" href="#" target="_blank" rel="noreferrer">
                  <span class="material-symbols-outlined">open_in_new</span>
                  ${link.label}
                </a>
              `
            )
            .join("")}
        </div>
        <button class="btn btn-primary sidebar-action" id="generate-sidebar" type="button">
          <span class="material-symbols-outlined">bolt</span>
          Generate Install URL
        </button>
        <button class="btn btn-outline sidebar-action" id="save-provider-setup" type="button">
          <span class="material-symbols-outlined">save</span>
          Save Provider Setup
        </button>
      </div>
    </aside>
    <main>
      <section class="page active" data-page="home">
        <div class="page-copy">
          <h1><span class="text-gradient">MHTV</span></h1>
          <p class="subtitle">A dedicated IPTV addon for <a class="inline-link" href="https://mediahoard.pages.dev" target="_blank" rel="noreferrer">MediaHoard</a>.</p>
        </div>
        <div class="dashboard-grid">
          <article class="glass-card feature-panel hero-panel">
            <div class="feature-icon"><span class="material-symbols-outlined">deployed_code</span></div>
            <h3>Stateless Install Token</h3>
            <p>Everything in this UI is encoded into the manifest path, so installs stay portable and easy to regenerate.</p>
            <div class="pill-list">
              <span class="pill">No local session</span>
              <span class="pill">Provider-aware</span>
              <span class="pill">MediaHoard-ready</span>
            </div>
          </article>
          <article class="glass-card feature-panel">
            <div class="feature-icon"><span class="material-symbols-outlined">swap_horiz</span></div>
            <h3>Provider Routing</h3>
            <p>Choose from sources and settings provided by <a class="inline-link" href="https://github.com/TheBinaryNinja/tvapp2" target="_blank" rel="noreferrer">TVApp2</a> or <a class="inline-link" href="https://i.mjh.nz/" target="_blank" rel="noreferrer">i.mjh.nz</a>.</p>
          </article>
          <article class="glass-card feature-panel">
            <div class="feature-icon"><span class="material-symbols-outlined">language</span></div>
            <h3>Regional Filtering</h3>
            <p>Keep the catalog focused by limiting regions before the addon queries channels and groups.</p>
          </article>
          <article class="glass-card feature-panel">
            <div class="feature-icon"><span class="material-symbols-outlined">play_circle</span></div>
            <h3>Playback Policy</h3>
            <p>Control resolution ordering, stream validation strictness, and whether grouped catalogs are exposed.</p>
          </article>
        </div>
      </section>

      <section class="page" data-page="configuration">
        <div class="page-copy">
          <p class="eyebrow">Playback</p>
          <h2>Configuration</h2>
          <p class="subtitle">This page now only handles addon behavior: playback preference, stream validation, and catalog layout.</p>
        </div>
        <div class="settings-grid">
          <article class="glass-card setting-card">
            <div class="feature-icon"><span class="material-symbols-outlined">high_quality</span></div>
            <h3>Resolution</h3>
            <p>Choose how MHTV sorts streams before playback.</p>
            <label class="field">
              <span>Resolution strategy</span>
              <select id="resolution">
                <option value="source_priority">Source priority</option>
                <option value="prefer_hd">Prefer HD</option>
                <option value="prefer_sd">Prefer SD</option>
              </select>
            </label>
          </article>
          <article class="glass-card setting-card">
            <div class="feature-icon"><span class="material-symbols-outlined">network_ping</span></div>
            <h3>Stream Validation</h3>
            <p>Define how aggressively the addon probes streams before returning them.</p>
            <label class="field">
              <span>Validation mode</span>
              <select id="stream-validation">
                <option value="balanced">Balanced probe + fallback</option>
                <option value="fast">Fast, skip probe</option>
                <option value="strict">Strict, only return live probes</option>
              </select>
            </label>
          </article>
          <article class="glass-card setting-card">
            <div class="feature-icon"><span class="material-symbols-outlined">grid_view</span></div>
            <h3>Catalog Layout</h3>
            <p>Choose whether Stremio sees the grouped channel catalogs or only search.</p>
            <label class="field">
              <span>Layout mode</span>
              <select id="catalog-layout">
                <option value="grouped">Grouped catalogs + search</option>
                <option value="search_only">Search only</option>
              </select>
            </label>
          </article>
        </div>
      </section>

      <section class="page" data-page="providers">
        <div class="page-copy">
          <p class="eyebrow">Sources</p>
          <h2>Providers</h2>
          <p class="subtitle">Sources moved here. Configure TVApp2 and i.mjh.nz independently, then decide which one should lead stream selection.</p>
        </div>
        <div class="provider-grid">
          ${renderProviderCards()}
        </div>
      </section>

      <section class="page" data-page="regions">
        <div class="page-copy">
          <p class="eyebrow">Coverage</p>
          <h2>Regions</h2>
          <p class="subtitle">Regional filtering now lives here, separate from playback and providers.</p>
        </div>
        <div class="region-layout">
          <article class="glass-card region-panel">
            <h3>Enabled Regions</h3>
            <p>Select the catalog regions you want MHTV to search.</p>
            <div class="selection-grid">
              ${renderRegionOptions()}
            </div>
          </article>
          <article class="glass-card region-panel">
            <h3>Filtering Notes</h3>
            <p>Region filters affect channel queries and group generation, so narrower selections produce smaller, cleaner catalogs.</p>
            <div class="note-list">
              <div class="note-item"><span class="material-symbols-outlined">check_circle</span><span>Use one or two regions for a focused install.</span></div>
              <div class="note-item"><span class="material-symbols-outlined">check_circle</span><span>Leave multiple providers enabled if you want better channel coverage.</span></div>
              <div class="note-item"><span class="material-symbols-outlined">check_circle</span><span>Add Global if you want mixed-region backup feeds.</span></div>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>

  <div class="modal" id="url-modal" aria-hidden="true">
    <div class="modal-card glass-card">
      <div class="modal-header">
        <div>
          <p class="eyebrow">Install URLs</p>
          <h3>Generated Links</h3>
        </div>
        <button class="icon-btn" id="close-modal" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="url-block">
          <p class="label">Manifest URL</p>
          <code id="manifest-url">${manifestUrl}</code>
          <button class="btn btn-outline copy-btn" data-target="manifest-url" type="button">Copy Manifest URL</button>
        </div>
        <div class="url-block">
          <p class="label">Stremio URL</p>
          <code id="stremio-url">stremio://${manifestUrl.replace(/^https?:\/\//, "")}</code>
          <button class="btn btn-outline copy-btn" data-target="stremio-url" type="button">Copy Stremio URL</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const pages = Array.from(document.querySelectorAll('.page'));
    const sidebar = document.getElementById('sidebar');
    const navOverlay = document.getElementById('nav-overlay');
    const modal = document.getElementById('url-modal');
    const modalOverlay = document.getElementById('url-modal-overlay');

    const getOrderedSources = () => {
      const providers = ${JSON.stringify(providerCards.map((provider) => provider.id))};
      return providers
        .map((id) => ({
          id,
          enabled: document.querySelector('input[name="source"][value="' + id + '"]').checked,
          priority: document.querySelector('input[name="' + id + '-priority"]:checked').value
        }))
        .filter((provider) => provider.enabled)
        .sort((left, right) => {
          const leftRank = left.priority === 'primary' ? 0 : 1;
          const rightRank = right.priority === 'primary' ? 0 : 1;
          return leftRank - rightRank;
        })
        .map((provider) => provider.id);
    };

    const buildConfig = () => {
      const sources = getOrderedSources();
      if (!sources.length) {
        return null;
      }
      const regions = Array.from(document.querySelectorAll('input[name="region"]:checked')).map((input) => input.value);
      return {
        sources,
        regions,
        resolution: document.getElementById('resolution').value,
        streamValidation: document.getElementById('stream-validation').value,
        catalogLayout: document.getElementById('catalog-layout').value,
        kptvMode: document.getElementById('kptv-mode')?.value || 'both',
        tvappMode: document.getElementById('tvapp-mode').value,
        mjhMode: document.getElementById('mjh-mode').value,
        xtreamMode: document.getElementById('xtream-mode')?.value || 'both',
        m3uMode: document.getElementById('m3u-mode')?.value || 'both',
        tvappSourceFamilies: Array.from(document.querySelectorAll('input[name="tvapp-family"]:checked')).map((input) => input.value),
        mjhFeedFamilies: Array.from(document.querySelectorAll('input[name="mjh-family"]:checked')).map((input) => input.value),
        includeGroups: [],
        excludeGroups: []
      };
    };

    const buildProviderSetup = () => ({
      kptvBaseUrl: document.getElementById('kptv-base-url')?.value?.trim() || '',
      kptvRegion: document.getElementById('kptv-region')?.value?.trim() || 'global',
      xtreamBaseUrl: document.getElementById('xtream-base-url')?.value?.trim() || '',
      xtreamUsername: document.getElementById('xtream-username')?.value?.trim() || '',
      xtreamPassword: document.getElementById('xtream-password')?.value || '',
      xtreamRegion: document.getElementById('xtream-region')?.value?.trim() || 'global',
      xtreamXmltvUrl: document.getElementById('xtream-xmltv-url')?.value?.trim() || '',
      m3uProviderUrls: (document.getElementById('m3u-provider-urls')?.value || '').split(/\\r?\\n/).map((entry) => entry.trim()).filter(Boolean),
      m3uEpgUrls: (document.getElementById('m3u-epg-urls')?.value || '').split(/\\r?\\n/).map((entry) => entry.trim()).filter(Boolean),
      m3uRegion: document.getElementById('m3u-region')?.value?.trim() || 'global'
    });

    const saveProviderSetup = async () => {
      const response = await fetch('/api/provider-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildProviderSetup())
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to save provider setup.' }));
        throw new Error(error.error || 'Failed to save provider setup.');
      }

      return response.json();
    };

    const updateUrls = () => {
      const config = buildConfig();
      if (!config) {
        alert('Enable at least one provider before generating install URLs.');
        return false;
      }
      const encoded = btoa(JSON.stringify(config)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '');
      const nextManifestUrl = '${appConfig.baseUrl}/' + encoded + '/manifest.json';
      document.getElementById('manifest-url').textContent = nextManifestUrl;
      document.getElementById('stremio-url').textContent = 'stremio://' + nextManifestUrl.replace(/^https?:\\/\\//, '');
      return true;
    };

    const showPage = (pageId) => {
      navItems.forEach((item) => item.classList.toggle('active', item.dataset.page === pageId));
      pages.forEach((page) => page.classList.toggle('active', page.dataset.page === pageId));
      sidebar.classList.remove('active');
      navOverlay.classList.remove('active');
    };

    const openModal = () => {
      const ready = updateUrls();
      if (!ready) {
        return;
      }
      modal.classList.add('active');
      modalOverlay.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
      modal.classList.remove('active');
      modalOverlay.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    };

    navItems.forEach((item) => {
      item.addEventListener('click', () => showPage(item.dataset.page));
    });

    document.getElementById('menu-toggle').addEventListener('click', () => {
      sidebar.classList.toggle('active');
      navOverlay.classList.toggle('active');
    });

    navOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      navOverlay.classList.remove('active');
    });

    document.getElementById('generate-sidebar').addEventListener('click', openModal);
    document.getElementById('save-provider-setup').addEventListener('click', async () => {
      try {
        await saveProviderSetup();
        alert('Provider setup saved. Re-run ingestion to pull the new sources.');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to save provider setup.');
      }
    });
    document.getElementById('close-modal').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.querySelectorAll('.copy-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const target = document.getElementById(button.dataset.target);
        await navigator.clipboard.writeText(target.textContent);
        button.textContent = 'Copied';
        setTimeout(() => {
          button.textContent = button.dataset.target === 'manifest-url' ? 'Copy Manifest URL' : 'Copy Stremio URL';
        }, 1200);
      });
    });

    document.querySelectorAll('.cross-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const port = link.dataset.port;
        if (!port) {
          return;
        }
        const nextUrl = window.location.protocol + '//' + window.location.hostname + ':' + port;
        window.open(nextUrl, '_blank', 'noopener,noreferrer');
      });
    });
  </script>
</body>
</html>`;
}
