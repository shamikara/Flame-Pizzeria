'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  adminComment: string | null;
  reviewedAt: string | null;
  reviewedBy: {
    // Add reviewedBy properties here
  }
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [adminComment, setAdminComment] = useState('');

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();
        
        if (!sessionData || !sessionData.user) {
          console.log('No session found, redirecting to login');
          router.push('/login');
          return;
        }
        
        if (sessionData.user.role !== 'ADMIN') {
          console.log('User is not an admin. Role:', sessionData.user.role);
          setError('You do not have permission to access this page');
          setLoading(false);
          return;
        }
        
        console.log('Admin session verified');
        setSession(sessionData.user);
        
        // Fetch reviews after session is verified
        fetchReviews(sessionData.user);
      } catch (error) {
        console.error('Error checking session:', error);
        setError('Failed to verify session');
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);


  const fetchReviews = async (userSession?: any) => {
    const currentSession = userSession || session;
    
    if (!currentSession) {
      setError('No active session');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching reviews...');
      const response = await fetch('/api/admin/reviews', {
        credentials: 'include' // Ensure cookies are sent with the request
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }
      
      console.log('Fetched reviews:', data);
      setReviews(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching reviews:', errorMessage);
      setError(`Failed to load reviews: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!session) return;
    if (!adminComment.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      setUpdatingId(id);
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          adminComment: adminComment || 'Review rejected by admin',
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

  const handleApprove = async (id: number) => {
    if (!session) {
      setError('No active session');
      return;
    }
    
    try {
      setUpdatingId(id);
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          adminComment: adminComment || 'Review approved by admin',
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update review status');
      }

      // Clear the admin comment field
      setAdminComment('');
      
      // Refresh the reviews list
      await fetchReviews();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error updating review status:', errorMessage);
      setError(`Failed to update review status: ${errorMessage}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Verifying session...</p>
        </div>
      </div>
    );
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
                      onClick={() => handleApprove(review.id)}
                      disabled={updatingId === review.id}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {updatingId === review.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={updatingId === review.id}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
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
