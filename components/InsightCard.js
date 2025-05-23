// components/InsightCard.js
import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  initial: (direction) => ({ // direction not used here for initial, but kept for consistency
    opacity: 0,
    y: 20,
    scale: 0.95,
  }),
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 20, duration: 0.5 },
  },
  exit: (direction) => ({
    x: direction > 0 ? 250 : -250, // Swipe out distance
    opacity: 0,
    rotate: direction > 0 ? 8 : -8, // Slight rotation on swipe
    scale: 0.9,
    transition: { ease: 'easeIn', duration: 0.3 },
  }),
};

const InsightCard = ({ insight, onSwipe, dragConstraints }) => {
  if (!insight) return null;

  // Accent color for the side light
  const accentColor = "border-sky-500"; // Or use 'border-brand-accent' if defined in Tailwind config

  return (
    <motion.div
      key={insight.id}
      className={`
        absolute bg-white rounded-xl shadow-card hover:shadow-card-hover
        w-full max-w-md 
        flex flex-col 
        cursor-grab active:cursor-grabbing
        overflow-hidden 
        border-l-[5px] ${accentColor}  /* SIDE LIGHT ACCENT */
        transition-shadow duration-300
      `}
      style={{ minHeight: '380px' }} // Ensure consistent height
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag="x"
      dragConstraints={dragConstraints || { left: -200, right: 200, top: 0, bottom: 0 }}
      dragElastic={0.25}
      onDragEnd={(event, info) => {
        const swipeThreshold = 80; // How far user needs to drag to trigger swipe
        if (info.offset.x > swipeThreshold) {
          onSwipe('right');
        } else if (info.offset.x < -swipeThreshold) {
          onSwipe('left');
        }
      }}
      custom={info => (info ? (info.offset.x > 0 ? 1 : -1) : 0)}
    >
      {/* Card Content Area */}
      <div className="flex-grow flex flex-col justify-center p-6 py-8 sm:p-8">
        <blockquote className="text-center">
          <p className="text-xl sm:text-2xl font-serif italic text-slate-800 leading-relaxed">
            "{insight.text}"
          </p>
        </blockquote>
      </div>

      {/* Footer inside the card */}
      <footer className="px-6 pb-6 sm:px-8 sm:pb-8 text-right border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-600 font-sans">
          — Naval Ravikant
        </p>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          The Almanack of Naval Ravikant
        </p>
      </footer>
    </motion.div>
  );
};

export default InsightCard;