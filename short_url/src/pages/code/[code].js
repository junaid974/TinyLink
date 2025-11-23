import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

export default function StatsPage() {
  const router = useRouter();
  const { code } = router.query;
  const [linkData, setLinkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const fetchStats = useCallback(async () => {
    if (!code) return;

    setIsLoading(true);
    setError(null);
    setLinkData(null);

    try {
      const res = await fetch(`/api/links/${code}`);

      if (res.status === 404) {
        throw new Error("Link not found.");
      }
      if (!res.ok) {
        throw new Error("Failed to fetch link statistics.");
      }

      const data = await res.json();
      setLinkData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while loading stats.");
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <p className="text-xl text-indigo-600">
          Loading link statistics for **{code}**...
        </p>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">
            {error || "Link not found or an error occurred."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Stats for {code} | TinyLink</title>
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-700">
            Link Statistics
          </h1>
          <p className="text-gray-500">
            Details for short code: **/{linkData.code}**
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Short Link:
            <a
              href={`${baseUrl}/${linkData.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-indigo-600 hover:underline"
            >
              {baseUrl}/{linkData.code}
            </a>
          </h2>

          <div className="space-y-6">
            <div className="border-b pb-4">
              <p className="text-sm font-medium text-gray-500">Target URL</p>
              <p className="text-lg text-gray-900 break-words max-w-full">
                {linkData.targeturl}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm font-medium text-gray-500">Total Clicks</p>
              <p className="text-3xl font-bold text-indigo-600">
                {linkData.totalClicks}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm font-medium text-gray-500">
                Last Clicked Time
              </p>
              <p className="text-lg text-gray-900">
                {formatDate(linkData.lastClicked)}
              </p>
            </div>

            <div className="pb-4">
              <p className="text-sm font-medium text-gray-500">Created On</p>
              <p className="text-lg text-gray-900">
                {formatDate(linkData.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-8 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 uniform button styles"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
