import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function LoadingCard() {
  return (
    <div className="p-5 bg-white/5 rounded-lg shadow border border-white/10 overflow-hidden">
      <div className="animate-shimmer relative space-y-4">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-shimmer-gradient bg-no-repeat bg-shimmer-position animate-shimmer-move"></div>
      </div>
    </div>
  );
} 