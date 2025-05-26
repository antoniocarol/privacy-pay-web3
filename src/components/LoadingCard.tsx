import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function LoadingCard() {
  return (
    <div className="flex flex-col w-full py-3 min-h-[120px]">
      <div className="flex items-center space-x-4 mb-6">
        <div className="overflow-hidden">
          <Skeleton circle height={48} width={48} baseColor="#E84142" highlightColor="#FF9B45" />
        </div>
        <div className="flex-1">
          <Skeleton height={16} width={100} baseColor="#E84142" highlightColor="#FF9B45" style={{ opacity: 0.7, marginBottom: 8 }} />
          <Skeleton height={28} width={120} baseColor="#E84142" highlightColor="#FF9B45" />
        </div>
      </div>
      <div className="mt-2">
        <Skeleton height={16} count={2} baseColor="#E84142" highlightColor="#FF9B45" style={{ opacity: 0.4, marginBottom: 8 }} />
      </div>
    </div>
  );
} 