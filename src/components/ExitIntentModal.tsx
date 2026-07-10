import { useEffect, useState } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const DISMISS_KEY = 'kb_exit_intent_seen';

export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    let shown = false;
    const trigger = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
    };

    // Desktop: mouse leaves toward the top (closing tab)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    // Mobile / fallback: fire after 25s of browsing
    const timer = window.setTimeout(trigger, 25000);

    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      window.clearTimeout(timer);
    };
  }, []);

  const close = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('leads').insert({ contact: contact.trim(), source: 'exit_intent' });
    setLoading(false);
    if (error) {
      toast.error('Kuch galat hua, dobara try karein.');
      return;
    }
    localStorage.setItem(DISMISS_KEY, '1');
    setDone(true);
    toast.success('Thank you! Hum jaldi contact karenge.');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-up">
      <div className="relative w-full max-w-md card-premium">
        <button
          onClick={close}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold mx-auto mb-4">
              <Gift className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold">You're on the list! 🎉</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Aapko exclusive offers aur welcome bonus ki details milengi.
            </p>
            <Link to="/register" onClick={close} className="btn-gold w-full justify-center mt-6">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold mb-4">
              <Gift className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-display text-2xl font-bold">Wait — don't leave empty-handed!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Apna email ya WhatsApp number chhodein aur pao ek{' '}
              <span className="text-gold font-semibold">exclusive welcome bonus</span> plus latest payout updates.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email ya WhatsApp number"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none"
              />
              <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
                {loading ? 'Saving...' : 'Claim My Bonus'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <button onClick={close} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-foreground">
              No thanks, I'll pass
            </button>
          </>
        )}
      </div>
    </div>
  );
}
