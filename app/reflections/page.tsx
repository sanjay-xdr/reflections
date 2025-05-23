// pages/reflections.js
"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon, ChatBubbleLeftEllipsisIcon, TrashIcon } from '@heroicons/react/24/outline';
import { baseNavalInsights } from '@/data/navalInsights';
// import { baseNavalInsights } from ''; // To get original insight text

const LOCAL_STORAGE_KEY_REFLECTIONS = 'navalReflections_light'; // Must match your main page
const LOCAL_STORAGE_KEY_INSIGHTS = 'navalInsightsSR_light'; // To potentially link insights to their SRS data

const ReflectionsPage = () => {
  const [reflections, setReflections] = useState({});
  const [allInsightsData, setAllInsightsData] = useState([]); // To get original insight text
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedReflections = localStorage.getItem(LOCAL_STORAGE_KEY_REFLECTIONS);
    const storedInsights = localStorage.getItem(LOCAL_STORAGE_KEY_INSIGHTS);

    if (storedReflections) {
      setReflections(JSON.parse(storedReflections));
    }

    // Load base insights to map reflection IDs to text
    // In a real app, insights would likely come from a DB or a more robust source
    if (storedInsights) {
        setAllInsightsData(JSON.parse(storedInsights));
    } else {
        // Fallback if SRS data isn't there but reflections might be, use base
        setAllInsightsData(baseNavalInsights);
    }

    setIsLoading(false);
  }, []);

  const getInsightTextById = (id) => {
    const insight = allInsightsData.find(ins => ins.id === id) || baseNavalInsights.find(ins => ins.id === id);
    return insight ? insight.text : "Unknown Insight";
  };

  const handleDeleteReflection = (insightId) => {
    const newReflections = { ...reflections };
    delete newReflections[insightId];
    setReflections(newReflections);
    localStorage.setItem(LOCAL_STORAGE_KEY_REFLECTIONS, JSON.stringify(newReflections));
  };

  const sortedReflectionIds = Object.keys(reflections).sort((a, b) => {
    // Optional: Sort by when the insight was last reflected on,
    // or simply by ID or some other criteria.
    // For now, simple ID sort or order of insertion.
    // If reflections stored timestamps, you could sort by that.
    return a.localeCompare(b);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading reflections...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Reflections | Naval Almanack</title>
        <meta name="description" content="Review your saved reflections." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-50 font-sans text-slate-700">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-sky-600" />
              <h1 className="text-2xl font-bold text-slate-800">My Reflections</h1>
            </div>
            <Link href="/" legacyBehavior>
              <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-sky-700 bg-sky-100 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Swiping
              </a>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {sortedReflectionIds.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftEllipsisIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">No Reflections Yet</h2>
              <p className="text-slate-500 mb-6">
                Start swiping and save your thoughts on insights to see them here.
              </p>
              <Link href="/" legacyBehavior>
                <a className="px-6 py-2.5 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2">
                  Find Insights
                </a>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedReflectionIds.map((insightId) => (
                <div key={insightId} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-sky-500">
                  <blockquote className="mb-4 pb-4 border-b border-slate-200">
                    <p className="text-lg italic text-slate-700 font-serif">
                      "{getInsightTextById(insightId)}"
                    </p>
                    <p className="text-xs text-slate-400 mt-2 text-right">
                        — Naval Ravikant (The Almanack)
                    </p>
                  </blockquote>
                  <div className="flex justify-between items-start">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {reflections[insightId]}
                    </p>
                    <button
                        onClick={() => handleDeleteReflection(insightId)}
                        title="Delete this reflection"
                        className="ml-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-200 mt-12">
            <p>© {new Date().getFullYear()} Your App Name. Keep reflecting!</p>
        </footer>
      </div>
    </>
  );
};

export default ReflectionsPage;