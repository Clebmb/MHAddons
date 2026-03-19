import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { SiGithubsponsors } from 'react-icons/si';
import { SiKofi } from 'react-icons/si';

export function DonationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const githubSponsorsUrl = 'https://github.com/sponsors/Viren070';
  const kofiUrl = 'https://ko-fi.com/Viren070';
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Support AIOStreams Development">
      <div className="flex flex-col gap-5 items-center text-center p-2">
        <div className="flex flex-col gap-2 items-center">
          <span className="text-3xl">💖</span>
          <h2 className="text-xl font-bold">Donate to Viren070</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            If you find this add-on useful, pllease donate to the original developer of AIOStreams, Viren070. Your donation helps me keep the project alive and improve it for everyone!
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full mt-2">
          <Button
            intent="alert-subtle"
            onClick={() => window.open(githubSponsorsUrl, '_blank')}
            leftIcon={<SiGithubsponsors />}
            className="w-full"
          >
            GitHub Sponsors
          </Button>
          <Button
            intent="alert-subtle"
            onClick={() => window.open(kofiUrl, '_blank')}
            leftIcon={<SiKofi />}
            className="w-full"
          >
            Ko-fi
          </Button>
        </div>
      </div>
    </Modal>
  );
}
