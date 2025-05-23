// lib/srs.js
import { addDays, differenceInDays, isPast, parseISO } from 'date-fns';

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

export const initializeInsightSR = (insight) => {
  return {
    ...insight,
    interval: 0, // days
    easeFactor: INITIAL_EASE_FACTOR,
    nextReviewDate: new Date().toISOString(), // Review immediately
    lastReviewedDate: null,
    repetitions: 0, // How many times this card has been successfully recalled
    history: [], // To store { date, quality }
  };
};

export const updateInsightSR = (insight, quality) => {
  // quality: 0 (Skip/Easy), 1 (Resonate/Good)
  const today = new Date();
  let newInterval;
  let newEaseFactor = insight.easeFactor;

  if (quality === 1) { // Resonated / Good
    if (insight.repetitions === 0) {
      newInterval = 1;
    } else if (insight.repetitions === 1) {
      newInterval = 3; // Longer first successful recall
    } else {
      newInterval = Math.round(insight.interval * newEaseFactor);
    }
    newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor + 0.1);
    insight.repetitions += 1;
  } else { // Skip / Easy
    if (insight.repetitions === 0) {
      newInterval = 3; // User feels they know it or not relevant now
    } else {
      // If skipped, but already seen, maybe progress it slightly less aggressively than a 'good'
      newInterval = Math.round(insight.interval * (newEaseFactor - 0.1)); 
    }
    // Don't decrease ease factor too much for a skip if it's already known
    newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.05);
    // Repetitions don't necessarily increase on a skip if it's "not relevant now"
    // but for simplicity, we'll treat it as a form of review.
    // If it was truly "not for me now", then SRL might not be the best for that specific interaction.
    // For now, we'll still advance it.
  }

  // Ensure interval is at least 1 day after the first review
  if (insight.repetitions > 0 && newInterval < 1) newInterval = 1;
  if (insight.repetitions === 0 && quality === 0 && newInterval < 3) newInterval = 3;


  return {
    ...insight,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewDate: addDays(today, newInterval).toISOString(),
    lastReviewedDate: today.toISOString(),
    history: [...(insight.history || []), { date: today.toISOString(), quality }]
  };
};

export const getNextInsightToReview = (allInsights) => {
  if (!allInsights || allInsights.length === 0) return null;

  // Filter for insights due for review (nextReviewDate is past or today)
  const dueInsights = allInsights.filter(insight => isPast(parseISO(insight.nextReviewDate)));

  if (dueInsights.length > 0) {
    // Sort due insights: ones with fewer repetitions first, then by earliest nextReviewDate
    return dueInsights.sort((a, b) => {
      if (a.repetitions !== b.repetitions) {
        return a.repetitions - b.repetitions;
      }
      return differenceInDays(parseISO(a.nextReviewDate), parseISO(b.nextReviewDate));
    })[0];
  }

  // If no insights are "due", pick the one with the earliest nextReviewDate (least recently studied)
  // or one that has never been reviewed.
  const notYetReviewed = allInsights.filter(i => i.repetitions === 0);
  if (notYetReviewed.length > 0) {
    return notYetReviewed.sort((a, b) => differenceInDays(parseISO(a.nextReviewDate), parseISO(b.nextReviewDate)))[0];
  }

  // If all have been reviewed and none are "due", pick the one with the overall earliest nextReviewDate
  return [...allInsights].sort((a, b) => differenceInDays(parseISO(a.nextReviewDate), parseISO(b.nextReviewDate)))[0];
};