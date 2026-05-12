import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award } from 'lucide-react';
import { SectionHeader } from '@/components/PremiumCard';
import type { AchievementsContent } from '@/hooks/useWebsiteContent';

interface Props {
  content: AchievementsContent;
}

export function AchievementsSection({ content }: Props) {
  const items = content.items ?? [];
  if (!items.length) return null;

  return (
    <section id="achievements" className="py-28 px-4 sm:px-6 lg:px-8 bg-ws-card-alt">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Trust"
          title={content.title || 'Achievements & Certifications'}
          subtitle={content.subtitle}
        />
        <AutoCarousel items={items} />
      </div>
    </section>
  );
}

function AutoCarousel({ items }: { items: AchievementsContent['items'] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stepNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[data-achievement-card]') as HTMLElement | null;
    const step = (card?.offsetWidth ?? 320) + 24;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    if (el.scrollLeft >= max - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(stepNext, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, stepNext]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);
  const tempPause = () => {
    setPaused(true);
    setTimeout(() => setPaused(false), 4000);
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pt-2 snap-x snap-mandatory"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onClick={tempPause}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          data-achievement-card
          className="min-w-[260px] sm:min-w-[300px] md:min-w-[320px] lg:basis-[calc((100%-3rem)/3)] lg:min-w-0 snap-start flex-shrink-0"
        >
          <AchievementCard item={item} index={i} />
        </div>
      ))}
    </div>
  );
}

function AchievementCard({ item, index }: { item: AchievementsContent['items'][0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="h-full"
    >
      <div
        className="group rounded-2xl border overflow-hidden hover:border-primary/40 transition-all duration-500 h-[280px] flex flex-col items-center text-center px-7 py-8 shadow-md hover:shadow-2xl hover:shadow-primary/10"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-5 flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300 p-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <Award className="h-10 w-10 text-primary/50" />
          )}
        </div>
        <h3 className="font-display font-bold text-base mb-2 line-clamp-2">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-ws-text-subtle leading-relaxed line-clamp-3">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
}
