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
export function Header({ currentPage }: { currentPage: string }) {
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
  if (currentPage !== 'presets') {
    return (
      <header className="mb-6 flex w-full justify-end">
        <Button
          onClick={() => {
            const host = `${window.location.protocol}//${window.location.host}`;
            window.open(`${host}/dashboard`, '_blank');
          }}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-[14px] border-white/10 bg-transparent text-[#99a8bc] shadow-lg hover:bg-white/5 hover:text-white"
          title="Open Dashboard"
        >
          <BarChart3 className="h-5 w-5" />
        </Button>
      </header>
    );
  }
  return (
    <header className="w-full mb-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-3xl flex-col gap-2">
          <h1 className="bg-[linear-gradient(90deg,#ffffff_0%,#3ce58a_70%)] bg-clip-text font-heading text-[clamp(2.6rem,6vw,4.4rem)] font-bold leading-[1.02] text-transparent">
            MHMetadata
          </h1>
          <p className="text-sm font-medium text-white md:text-base">
            MHMetadata is a fork of <a href="https://github.com/cedya77/aiometadata" target="_blank" rel="noopener noreferrer" className="hover:underline italic">AIOMetadata</a> (created by Cedya77), optimized for <a href="https://mediahoard.pages.dev" target="_blank" rel="noopener noreferrer" className="text-[#39E079] hover:underline font-bold">MediaHoard</a>.<br />
            <a href="https://buymeacoffee.com/cedya" target="_blank" rel="noopener noreferrer" className="text-white underline italic">Click here to donate to the original developer of AIOMetadata.</a>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-start">
          <Button
            onClick={() => {
              const host = `${window.location.protocol}//${window.location.host}`;
              window.open(`${host}/dashboard`, '_blank');
            }}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-[14px] border-white/10 bg-transparent text-[#99a8bc] shadow-lg hover:bg-white/5 hover:text-white"
            title="Open Dashboard"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
