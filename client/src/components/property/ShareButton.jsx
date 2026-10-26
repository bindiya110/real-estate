import toast from 'react-hot-toast';
import { Share2 } from 'lucide-react';
import Button from '../common/Button';

export default function ShareButton({ title, text }) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <Button variant="secondary" size="sm" icon={Share2} onClick={share} className="h-10 rounded-full">
      Share
    </Button>
  );
}
