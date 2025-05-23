// pages/index.js
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import InsightCard from '../components/InsightCard';
import InsightCardSkeleton from '../components/InsightCardSkeleton'; // Ensure this is styled for light mode if used
import ReflectionModal from '../components/ReflectionModal';
import { baseNavalInsights } from '../data/navalInsights';
import { initializeInsightSR, updateInsightSR, getNextInsightToReview } from '../lib/srs';
import {
  BookOpenIcon,
  ArrowPathIcon,
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  ForwardIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const LOCAL_STORAGE_KEY_INSIGHTS = 'navalInsightsSR_light'; // Changed key to reset for new UI
const LOCAL_STORAGE_KEY_REFLECTIONS = 'navalReflections_light';

export default function HomePage() {
  // ... (useState hooks remain largely the same) ...
  const [allInsights, setAllInsights] = useState([]);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [insightToReflect, setInsightToReflect] = useState(null);
  const [reflections, setReflections] = useState({});
  const [swipeDirection, setSwipeDirection] = useState(0);

  // ... (useEffect for loading/saving data - remember to adjust LOCAL_STORAGE_KEY if you want to reset) ...
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const storedInsights = localStorage.getItem(LOCAL_STORAGE_KEY_INSIGHTS);
      const storedReflections = localStorage.getItem(LOCAL_STORAGE_KEY_REFLECTIONS);

      if (storedReflections) setReflections(JSON.parse(storedReflections));

      let insightsData;
      if (storedInsights) {
        insightsData = JSON.parse(storedInsights);
        baseNavalInsights.forEach(baseInsight => {
          if (!insightsData.find(i => i.id === baseInsight.id)) {
            insightsData.push(initializeInsightSR(baseInsight));
          }
        });
      } else {
        insightsData = baseNavalInsights.map(initializeInsightSR);
      }
      setAllInsights(insightsData);
      setIsLoading(false);
    }, 500); // Shorter loading sim
  }, []);

  useEffect(() => {
    if (allInsights.length > 0 && !isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_INSIGHTS, JSON.stringify(allInsights));
    }
  }, [allInsights, isLoading]);

  useEffect(() => {
    if (Object.keys(reflections).length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY_REFLECTIONS, JSON.stringify(reflections));
    }
  }, [reflections]);

  useEffect(() => {
    if (!isLoading && allInsights.length > 0 && !currentInsight) {
      setCurrentInsight(getNextInsightToReview(allInsights));
    }
  }, [allInsights, isLoading, currentInsight]);


  const processSwipe = useCallback((insightId, quality) => {
    const updatedInsights = allInsights.map(insight =>
      insight.id === insightId ? updateInsightSR(insight, quality) : insight
    );
    setAllInsights(updatedInsights);
    setCurrentInsight(null);
  }, [allInsights]);

  const handleSwipe = (direction) => {
    if (!currentInsight) return;
    setSwipeDirection(direction === 'right' ? 1 : -1);

    if (direction === 'right') {
      setInsightToReflect(currentInsight);
      setShowReflectionModal(true);
    } else {
      processSwipe(currentInsight.id, 0);
    }
  };

  const handleSaveReflection = (insightId, text) => {
    setReflections(prev => ({ ...prev, [insightId]: text }));
    processSwipe(insightId, 1);
    setShowReflectionModal(false);
    setInsightToReflect(null);
  };

  const handleCloseReflectionModal = () => {
    if (insightToReflect) {
      processSwipe(insightToReflect.id, 1);
    }
    setShowReflectionModal(false);
    setInsightToReflect(null);
  };
  
  const cardStack = useMemo(() => {
    if (isLoading) {
      // Ensure Skeleton matches new theme
      return (
        <div className="bg-white rounded-xl shadow-card p-6 md:p-10 min-h-[380px] w-full max-w-md flex flex-col justify-between animate-pulse border-l-[5px] border-slate-200">
            <div className="space-y-5">
                <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto"></div>
                <div className="h-5 bg-slate-200 rounded w-full mx-auto"></div>
                <div className="h-5 bg-slate-200 rounded w-5/6 mx-auto"></div>
                <div className="h-5 bg-slate-200 rounded w-3/5 mx-auto"></div>
            </div>
            <div className="mt-8 space-y-2 text-right">
                <div className="h-4 bg-slate-200 rounded w-1/3 ml-auto"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4 ml-auto"></div>
            </div>
        </div>
      );
    }
    if (!currentInsight && !isLoading) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-slate-600 p-8 bg-white rounded-lg shadow-lg max-w-md w-full"
        >
          <SparklesIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <p className="text-2xl font-semibold text-slate-800 mb-2">All Insights Reviewed!</p>
          <p className="text-slate-500 mb-6">Great job! Come back later for more reviews based on spaced repetition.</p>
          <button
            onClick={() => {
              const resetInsights = baseNavalInsights.map(initializeInsightSR);
              setAllInsights(resetInsights);
              setCurrentInsight(null);
              localStorage.removeItem(LOCAL_STORAGE_KEY_INSIGHTS);
              localStorage.removeItem(LOCAL_STORAGE_KEY_REFLECTIONS);
              setReflections({});
            }}
            className="mt-4 px-6 py-2.5 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 flex items-center mx-auto"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Reset & Start Over
          </button>
        </motion.div>
      );
    }
    return (
      <AnimatePresence initial={false} custom={swipeDirection}>
        {currentInsight && (
          <InsightCard
            key={currentInsight.id}
            insight={currentInsight}
            onSwipe={handleSwipe}
          />
        )}
      </AnimatePresence>
    );
  }, [isLoading, currentInsight, swipeDirection, handleSwipe, allInsights]); // Added allInsights to deps for reset button

  return (
    <>
      <Head>
        <title>Naval Almanack Insights | Marinate</title>
        <meta name="description" content="Marinate on ideas from The Almanack of Naval Ravikant with Spaced Repetition" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet" />
      </Head>

      

      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        
        <header className="mb-8 md:mb-10 text-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center space-x-2.5 mb-3"
          >
            <BookOpenIcon className="h-7 w-7 text-sky-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
              Naval's Almanack
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base md:text-lg"
          >
            Swipe to marinate. Reflect to internalize. Powered by Spaced Repetition.
          </motion.p>
              <div className="mt-4">
            <Link href="/reflections" legacyBehavior>
              <a className="text-sm text-sky-600 hover:text-sky-700 hover:underline font-medium">
                View My Reflections
              </a>
            </Link>
          </div>
        </header>

        <main className="relative w-full max-w-md h-[450px] flex items-center justify-center">
          {/* Increased height slightly for card content */}
          {cardStack}
        </main>

        <AnimatePresence>
        {currentInsight && !isLoading && (
          <motion.footer 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            exit={{ opacity: 0, y: 20}}
            className="mt-8 md:mt-10 flex items-center space-x-4 sm:space-x-5"
          >
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSwipe('left')}
              title="Pass / See Later"
              className="p-3.5 sm:p-4 bg-white rounded-full shadow-md hover:shadow-lg text-slate-500 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <ForwardIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (currentInsight) {
                  setInsightToReflect(currentInsight);
                  setShowReflectionModal(true);
                }
              }}
              title="Reflect on this Insight"
              className="p-4 sm:p-5 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-600 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
            >
              <ChatBubbleLeftEllipsisIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSwipe('right')}
              title="Resonates with me"
              className="p-3.5 sm:p-4 bg-white rounded-full shadow-md hover:shadow-lg text-rose-500 hover:text-rose-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
            >
              <HeartIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </motion.button>
          </motion.footer>
        )}
        </AnimatePresence>
        
        <ReflectionModal
          isOpen={showReflectionModal}
          insight={insightToReflect}
          onClose={handleCloseReflectionModal}
          onSave={handleSaveReflection}
        />

        {/* Optional: Footer for attribution or links */}
        <footer className="mt-12 text-center text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Your App Name. Inspired by insights.</p>
        </footer>
      </div>
    </>
  );
}