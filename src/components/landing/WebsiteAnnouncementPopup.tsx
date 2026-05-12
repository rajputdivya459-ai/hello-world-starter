import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PopupContent, WebsiteContentRow } from '@/hooks/useWebsiteContent';

const DISMISS_KEY = 'gymos_popup_dismissed_v1';

const themeStyles: Record<NonNullable<PopupContent['theme']>, string> = {
  light:    'bg-white text-zinc-900 border border-zinc-200',
  dark:     'bg-zinc-950 text-white border border-white/10',
  gradient: 'bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 text-white border border-white/20',
  offer:    'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white border border-amber-300/40',
};

interface Props {
  row?: WebsiteContentRow;
}

export function WebsiteAnnouncementPopup({ row }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!row || !row.is_enabled) { setOpen(false); return; }
    const c = (row.content ?? {}) as PopupContent;
    if (c.is_enabled === false) { setOpen(false); return; }
    try {
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      if (dismissed === row.updated_at) { setOpen(false); return; }
    } catch {}
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [row?.id, row?.updated_at, row?.is_enabled]);

  const close = () => {
    setOpen(false);
    try { if (row?.updated_at) window.localStorage.setItem(DISMISS_KEY, row.updated_at); } catch {}
  };

  if (!row) return null;
  const c = (row.content ?? {}) as PopupContent;
  const theme = c.theme ?? 'gradient';

  const handleCta = () => {
    if (!c.cta_link) return;
    if (c.cta_link.startsWith('#')) {
      const el = document.querySelector(c.cta_link);
      el?.scrollIntoView({ behavior: 'smooth' });
      close();
      return;
    }
    window.open(c.cta_link, c.cta_link.startsWith('http') ? '_blank' : '_self');
    close();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={c.title || 'Announcement'}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${themeStyles[theme]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label="Close announcement"
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <X className="h-4 w-4" />
            </button>

            {c.image_url && (
              <div className="w-full aspect-[16/9] overflow-hidden bg-black/20">
                <img src={c.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="px-6 py-7 sm:px-8 sm:py-8 max-h-[70vh] overflow-y-auto">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-80 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Announcement
              </div>
              {c.title && (
                <h2 className="text-2xl sm:text-3xl font-bold font-display leading-tight mb-2">
                  {c.title}
                </h2>
              )}
              {c.message && (
                <p className="text-sm sm:text-base leading-relaxed opacity-90 whitespace-pre-line">
                  {c.message}
                </p>
              )}

              {c.cta_text && c.cta_link && (
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleCta}
                    className={`w-full sm:w-auto h-11 px-6 font-semibold ${
                      theme === 'light'
                        ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                        : 'bg-white text-zinc-900 hover:bg-white/90'
                    }`}
                  >
                    {c.cta_text}
                  </Button>
                  <Button
                    onClick={close}
                    variant="ghost"
                    className={`w-full sm:w-auto h-11 px-6 ${
                      theme === 'light' ? 'text-zinc-700 hover:bg-zinc-100' : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Maybe later
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
