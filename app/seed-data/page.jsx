'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedCourses, enrollSampleUserInCourses } from '@/lib/firebase-seed';
import { getCurrentUser } from '@/lib/firebase-auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeedCourses = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await seedCourses();
      setResult(`Successfully seeded ${response.count} courses!`);
    } catch (err) {
      setError(err.message || 'Failed to seed courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCurrentUser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await enrollSampleUserInCourses(user.uid);
      setResult('Successfully enrolled in all courses!');
    } catch (err) {
      setError(err.message || 'Failed to enroll user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firebase Data Seeding
          </h1>
          <p className="text-gray-600 mb-8">
            Use this page to populate your Firebase database with sample data for testing.
          </p>

          <div className="space-y-6">
            {/* Seed Courses */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Seed Courses
              </h2>
              <p className="text-gray-600 mb-4">
                This will create 3 sample courses with modules and lessons in your Firestore database.
              </p>
              <Button
                onClick={handleSeedCourses}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  'Seed Courses'
                )}
              </Button>
            </div>

            {/* Enroll User */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Enroll Current User
              </h2>
              <p className="text-gray-600 mb-4">
                Enroll the currently signed-in user in all courses. Make sure you're signed in first!
              </p>
              <Button
                onClick={handleEnrollCurrentUser}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  'Enroll Current User'
                )}
              </Button>
            </div>

            {/* Result Messages */}
            {result && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">{result}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                <li>Make sure you've configured Firebase (see FIREBASE_SETUP.md)</li>
                <li>Click "Seed Courses" to create sample courses</li>
                <li>Sign in with a test account</li>
                <li>Click "Enroll Current User" to enroll in courses</li>
                <li>Navigate to the dashboard to see your courses!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
