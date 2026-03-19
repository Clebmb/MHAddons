<p align="center">
<img width="1230" height="920" alt="mhsexample" src="https://github.com/user-attachments/assets/3558d45f-0e38-4698-a9a7-3609b201b587" alt="Preview" width="750"/>
</p>

<h1 align="center">MHStreams</h1>

<p align="center">
  <strong>MediaHoard Stream Aggregator</strong>
  <br />
  MHStreams is a highly customizable super-addon that brings together various MediaHoard/Stremio addons, debrid services, and its own built-in tools into one unified experience, optimized for MediaHoard.
</p>

---

## 🎥 What is MHStreams?

Originally forked from [AIOStreams](https://github.com/Viren070/AIOStreams)—a widely used Stremio addon—MHStreams was designed to put you in the driver's seat of your MediaHoard experience. It completely eliminates the hassle of bouncing between different addons and their clunky configurations. Acting as a master hub, it pulls from all your chosen sources, processes the results through your custom rules, and outputs a single, easy-to-read list. Whether you just want a clean, unified view of your streams or you're a power user meticulously tweaking every parameter, MHStreams adapts to your needs.

## 🚀 Setup

- **[Deployment Guide](https://github.com/Clebmb/MHStreams/blob/main/SETUP.md)**


## ✨  Key Features

- **Unified Results**: Consolidate streams from multiple addons into one sorted and formatted list.
- **One-Click Config**: Marketplace addons auto-configure with your debrid keys.
- **Live Updates**: Background updates ensure you always have the latest fixes.
- **Full Compatibility**: Import any MediaHoard or Stremio addon via URL.
- **Unified Interface**: Manage all catalogs and metadata from a single hub.


MHStreams includes over 10 built-in scrapers and tools:
- **Direct Search**: GDrive, TorBox, Torrent Galaxy, AnimeTosho.
- **Indexers & Proxies**: Knaben, Zilean, Bitmagnet.
- **Self-Hosted Integration**: Jackett, Prowlarr, NZBHydra, Newznab, Torznab.

> [!NOTE]
> Built-in addons that search for torrents require a debrid service and do not yet support P2P streaming. Usenet results can be streamed directly from your Usenet provider via [NZBDav](https://github.com/nzbdav-dev/nzbdav) or [AltMount](https://github.com/javi11/altmount), or through TorBox (Pro plan required). All built-in addons come with anime support and support Kitsu/MAL catalogs.

The suite of built-in addons includes:

- **MediaHoard GDrive**: Connect your Google Drive to MediaHoard.
- **TorBox Search**: An alternative to the official TorBox addon with more customisability and support for more debrid services.
- **Knaben**: Scrapes Knaben, an indexer proxy for several popular torrent sites including The Pirate Bay, 1337x, and Nyaa.si.## 🚀 Setup

- **[Deployment Guide](https://github.com/Clebmb/MHStreams/blob/main/SETUP.md)**

- **Zilean**: Scrapes an instance of Zilean - A DMM hashlist scraper.
- **AnimeTosho**: Searches AnimeTosho, which mirrors most anime from Nyaa.si and TokyoTosho.
- **Torrent Galaxy**: Searches Torrent Galaxy for results.
- **Bitmagnet**: Scrape your self-hosted Bitmagnet instance - a BitTorrent indexer and DHT crawler. Set `BUILTIN_BITMAGNET_URL` for the addon to appear.
- **Jackett**: Connect and scrape your Jackett instance by providing its URL and API key.
- **Prowlarr**: Connect and scrape your Prowlarr instance by providing its URL and API key.
- **NZBHydra**: Stream results from your Usenet indexers by connecting your NZBHydra instance.
- **Newznab**: Directly configure and scrape your Usenet indexers for results using a Newznab API.
- **Torznab**: Configure any Torznab API to scrape torrent results, allowing individual indexers from Jackett to be added separately.

### 🔬 Advanced Filtering & Sorting Engine

Configure your rules once and apply them to all addons. This centralized engine offers:
- **Granular Rules**: Include, require, or exclude content based on resolution, quality, source type, language, and more.
- **Dynamic Logic**: Use our [Stream Expression Language](https://github.com/Viren070/MHStreams/wiki/Stream-Expression-Language) for conditional filtering (e.g., "only hide 720p if 1080p is available").
- **Smart Matching**: TMDB-integrated title matching and custom deduplication (via infohash or smart detection).
- **Pro Sorting**: Create custom sort orders for movies, series, and anime.

### 🗂️ Unified Catalog Management

Take full control of your home page. Manage all addon catalogs in a single location:
- **Organize**: Rename, reorder, or disable catalogs to clean up your interface.
- **Shuffle**: Discover new content by shuffling results (with optional persistence).
- **RPDB Integration**: Automatically apply high-quality posters to any supported metadata source.

### 🎨 Total Customization

Design your perfect stream list with our powerful [templating system](https://github.com/Viren070/MHStreams/wiki/Custom-Formatter):
- **Live Preview**: See formatting changes in real-time as you build them.
- **Predefined Presets**: Get started instantly with built-in templates inspired by top community addons.

### 🛡️ Proxy

- **Seamless Routing**: Proxy streams through internal or external services like **MediaFlow** or **StremThru**.
- **Bypass Limits**: Essential for overcoming IP restrictions and simultaneous connection limits.

And many more features...

## ❤️ Support the original developer of AIOStreams

  **Donate to Viren070**
  - **[Ko-fi](https://ko-fi.com/viren070)**
  - **[GitHub Sponsors](https://github.com/sponsors/Viren070)**

---

## ⚠️ Disclaimer

MHStreams is a tool for aggregating and managing data from independent MediaHoard/Stremio addons. It does not host, store, or distribute any content. The developer does not endorse or promote access to copyrighted content. Users are solely responsible for complying with all applicable laws and the terms of service for any addons or services they use with MHStreams.

## 🙏 Credits

Original project (AIOStreams) created by [Viren070](https://github.com/viren070/). Additionallity, this project wouldn't be possible without the foundational work of many others in the community, especially those who develop the addons that MHStreams integrates. Special thanks to the developers of all the integrated addons, the creators of [mhdzumair/mediaflow-proxy](https://github.com/mhdzumair/mediaflow-proxy) and [MunifTanjim/stremthru](https://github.com/MunifTanjim/stremthru), and the open-source projects that inspired parts of MHStreams' design:

- UI Components and issue templates adapted with permission from [5rahim/seanime](https://github.com/5rahim/seanime) (which any anime enthusiast should definitely check out!)
- [NzbDAV](https://github.com/nzbdav-dev/nzbdav) & [AltMount](https://github.com/javi11/altmount) integration inspired by [Sanket9225/UsenetStreamer](https://github.com/Sanket9225/UsenetStreamer/)
- [sleeyax/stremio-easynews-addon](https://github.com/sleeyax/stremio-easynews-addon) for the projects initial structure
- Custom formatter system inspired by and adapted from [diced/zipline](https://github.com/diced/zipline).
- Condition engine powered by [silentmatt/expr-eval](https://github.com/silentmatt/expr-eval)
