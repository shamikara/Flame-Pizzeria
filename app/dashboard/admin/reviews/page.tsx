'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Review = {
  id: number;
  stars: number;
  comment: string | null;
  status: string;
  adminComment: string | null;
  reviewedAt: string | null;
  reviewedBy: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  foodItem: {
    id: number;
    name: string;
  };
};

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.roles?.includes('ADMIN')) {
      router.push('/login');
      return;
    }

    fetchReviews();
  }, [session, status, router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      setUpdatingId(reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          adminComment: status === 'REJECTED' ? adminComment : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      // Refresh the reviews list
      await fetchReviews();
      setAdminComment('');
    } catch (err) {
      console.error('Error updating review status:', err);
      setError('Failed to update review status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>
      
      {reviews.length === 0 ? (
        <p>No pending reviews to moderate.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{review.user.firstName} {review.user.lastName}</span>
                    <span className="text-gray-500">reviewed</span>
                    <span className="font-semibold">{review.foodItem.name}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.stars ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-col space-y-4">
                  <div>
                    <label htmlFor={`comment-${review.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Comment (required if rejecting):
                    </label>
                    <textarea
                      id={`comment-${review.id}`}
                      rows={2}
                      className="w-full p-2 border rounded"
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                      disabled={updatingId === review.id}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {updatingId === review.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                      disabled={updatingId === review.id || !adminComment.trim()}
                      className={`px-4 py-2 ${
                        !adminComment.trim() ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'
                      } text-white rounded disabled:opacity-50`}
                    >
                      {updatingId === review.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
