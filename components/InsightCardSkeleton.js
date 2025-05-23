// components/InsightCardSkeleton.js
const InsightCardSkeleton = () => {
  return (
    <div className="bg-white/80 rounded-xl shadow-card p-6 md:p-10 min-h-[350px] w-full max-w-lg flex flex-col justify-between animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-slate-300 rounded w-3/4 mx-auto"></div>
        <div className="h-6 bg-slate-300 rounded w-full mx-auto"></div>
        <div className="h-6 bg-slate-300 rounded w-5/6 mx-auto"></div>
      </div>
      <div className="mt-6 space-y-2 text-right">
        <div className="h-4 bg-slate-300 rounded w-1/3 ml-auto"></div>
        <div className="h-3 bg-slate-300 rounded w-1/4 ml-auto"></div>
      </div>
    </div>
  );
};

export default InsightCardSkeleton;