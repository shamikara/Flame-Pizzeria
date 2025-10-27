import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}