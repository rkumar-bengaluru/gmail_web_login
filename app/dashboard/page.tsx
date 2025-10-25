// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { Test, Topic } from '@/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 🔑 Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 🔒 Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔒 Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: '/login' });
  };

  // 🟡 Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!session?.user) return null;

  // 🧪 Validate userData
  let allTests: Test[] = [];
  try {
    const userData = session.user.userData as Topic[] | undefined;
    if (!Array.isArray(userData)) {
      throw new Error('Invalid user data format');
    }
    allTests = userData.flatMap(topic => {
      if (!topic.tests || !Array.isArray(topic.tests)) return [];
      return topic.tests;
    });
  } catch (err) {
    console.error('Failed to parse user data:', err);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center p-4">
          <p>Failed to load test data.</p>
          <button 
            onClick={() => router.push('/login')} 
            className="mt-4 text-indigo-600 hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const user = session.user;
  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Profile dropdown (portal-style, but in normal flow for simplicity) */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Tests</h1>
          
          {/* User Profile Avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              aria-label="User menu"
              aria-expanded={isProfileOpen}
            >
              {userInitials}
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center disabled:opacity-75"
                >
                  {isLoggingOut ? 'Logging out...' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>

        {allTests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No tests available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTests.map((test) => (
              <div
                key={test.test_name}
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => setSelectedTest(test)}
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{test.test_name}</h3>
                  <p className="text-sm text-gray-500 mb-1">Role: {test.role}</p>
                  <p className="text-sm text-gray-500 mb-1">Date: {formatDate(test.date)}</p>
                  <p className="text-sm text-gray-500">Questions: {test.questions?.length || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for selected test */}
        {selectedTest && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20"
            onClick={() => setSelectedTest(null)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedTest.test_name}</h3>
              <p className="text-gray-600 mb-2"><span className="font-medium">Role:</span> {selectedTest.role}</p>
              <p className="text-gray-600 mb-2"><span className="font-medium">Date:</span> {formatDate(selectedTest.date)}</p>
              <p className="text-gray-600 mb-4">
                <span className="font-medium">No. of Questions:</span> {selectedTest.questions?.length || 0}
              </p>
              <button
                onClick={() => setSelectedTest(null)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}