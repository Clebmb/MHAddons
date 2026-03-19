import { ThemeToggle } from '../ThemeToggle';
import { useConfig } from '../../contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { InstallDialog } from '../InstallDialog';
import { toast } from 'sonner';
import { compressToEncodedURIComponent } from 'lz-string';
import { BarChart3 } from 'lucide-react';
import { ChangelogModal } from '../ChangelogBox';
import { cn } from '@/lib/utils';
export function Header() {
  const { addonVersion, config, setConfig, resetConfig, auth, setAuth, hasBuiltInTvdb, hasBuiltInTmdb } = useConfig();
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [manifestUrl, setManifestUrl] = useState('');
  useEffect(() => {
    try {
      if (window.location.pathname.includes('/configure')) {
        sessionStorage.setItem(
          'lastConfigureUrl',
          window.location.pathname + window.location.search + window.location.hash
        );
      }
    } catch { }
  }, []);

  const openInstall = () => {
    const tmdbKey = config.apiKeys.tmdb?.trim();
    const tvdbKey = config.apiKeys.tvdb?.trim();
    const hasTmdbAvailable = tmdbKey || hasBuiltInTmdb;
    if (!hasTmdbAvailable) {
      toast.error('TMDB API Key is Required', {
        description:
          "Please go to the 'Integrations' tab and enter your TMDB API key. This is the primary data source for the addon.",
        duration: 5000,
      });
      return;
    }

    // Only require TVDB key if it's actually selected as a provider
    const isTvdbUsedInProviders =
      config.providers?.movie === 'tvdb' ||
      config.providers?.series === 'tvdb' ||
      config.providers?.anime === 'tvdb';

    const isTvdbUsedInArt = ['movie', 'series', 'anime'].some(contentType => {
      const provider = config.artProviders?.[contentType];
      if (typeof provider === 'string') {
        return provider === 'tvdb';
      }
      if (typeof provider === 'object' && provider !== null) {
        return provider.poster === 'tvdb' ||
          provider.background === 'tvdb' ||
          provider.logo === 'tvdb';
      }
      return false;
    });

    const isTvdbUsed = isTvdbUsedInProviders || isTvdbUsedInArt;
    const hasTvdbAvailable = tvdbKey || hasBuiltInTvdb;

    if (!hasTvdbAvailable && isTvdbUsed) {
      toast.error('TVDB API Key Required', {
        description:
          "You've selected TVDB as a provider, but haven't entered your TVDB API key. Please add it in the 'Integrations' tab or choose a different provider.",
        duration: 5000,
      });
      return;
    }

    const configToSerialize = {
      language: config.language,
      includeAdult: config.includeAdult,
      blurThumbs: config.blurThumbs,
      showPrefix: config.showPrefix,
      providers: config.providers,
      tvdbSeasonType: config.tvdbSeasonType,
      apiKeys: config.apiKeys,
      ageRating: config.ageRating,
      catalogs: config.catalogs.filter((c) => c.enabled),
      castCount: config.castCount,
      search: config.search,
    };
    const compressedConfig = compressToEncodedURIComponent(
      JSON.stringify(configToSerialize)
    );
    const host = `${window.location.protocol}//${window.location.host}`;
    const generatedManifestUrl = `${host}/stremio/preview/${compressedConfig}/manifest.json`;
    setManifestUrl(generatedManifestUrl);
    setIsInstallOpen(true);
  };

  const [authTransitioning, setAuthTransitioning] = useState(false);
  return (
    <header className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white font-heading">
              MHMetadata
            </h1>
          </div>
          <p className="text-sm text-white font-medium">
            MHMetadata is a fork of <a href="https://github.com/cedya77/aiometadata" target="_blank" rel="noopener noreferrer" className="hover:underline italic">AIOMetadata</a> (created by Cedya77), optimized for <a href="https://mediahoard.pages.dev" target="_blank" rel="noopener noreferrer" className="text-[#39E079] hover:underline font-bold">MediaHoard</a>.<br />
            <a href="https://buymeacoffee.com/cedya" target="_blank" rel="noopener noreferrer" className="text-white underline italic">Click here to donate to the original developer of AIOMetadata.</a>
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <Button
            onClick={() => {
              const host = `${window.location.protocol}//${window.location.host}`;
              window.open(`${host}/dashboard`, '_blank');
            }}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white shadow-lg"
            title="Open Dashboard"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
