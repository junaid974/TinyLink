import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Layout from "../components/Layout";

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  alert(`Copied: ${text}`);
};

const formatDate = (dateString) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleString();
};

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to fetch links.");
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
      setError("Could not load links.");
    }
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    if (!targetUrl || !targetUrl.startsWith("http")) {
      setError("Please enter a valid URL (starting with http:// or https://)");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, customCode: customCode || null }),
      });

      if (res.status === 409) {
        setError("Error: That custom short code is already in use.");
      } else if (!res.ok) {
        throw new Error("Failed to create link.");
      } else {
        const newLink = await res.json();
        setSuccess(`Link created successfully! Short code: ${newLink.code}`);
        setTargetUrl("");
        setCustomCode("");
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateClickStats = async (code) => {
    try {
      await fetch(`/api/links/${code}`, {
        method: "PUT",
      });
      fetchLinks();
    } catch (err) {
      console.error("Failed to update click stats:", err);
    }
  };

  const handleDelete = async (code) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the link with code: ${code}?`
      )
    )
      return;

    try {
      await fetch(`/api/links/${code}`, { method: "DELETE" });

      setSuccess(`Link ${code} deleted successfully.`);
      fetchLinks();
    } catch (err) {
      setError("Failed to delete link.");
    }
  };

  return (
    <>
      <Head>
        <title>TinyLink Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-700">
            TinyLink Dashboard
          </h1>
          <p className="text-gray-500">
            Manage your shortened URLs and view click statistics.
          </p>
        </header>
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Create New Short Link
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="targetUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Target URL (Long URL)
              </label>
              <input
                id="targetUrl"
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://your-very-long-link.com/page/section..."
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="customCode"
                className="block text-sm font-medium text-gray-700"
              >
                Custom Short Code (Optional, 6-8 chars)
              </label>
              <div className="flex items-center mt-1">
                <input
                  id="customCode"
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  maxLength={8}
                  pattern="[A-Za-z0-9]{6,8}"
                  placeholder="e.g., docs"
                  className="block w-full border border-gray-300 rounded-r-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isLoading ? "Creating..." : "Shorten Link"}
            </button>
          </form>
        </div>
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            All TinyLinks
          </h2>
          {links.length === 0 && !isLoading && (
            <div className="text-center p-10 text-gray-500">
              No links created yet. Start by creating one above!
            </div>
          )}
          {isLoading && links.length === 0 && (
            <div className="text-center p-10 text-gray-500">
              Loading links...
            </div>
          )}

          {links.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Clicked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {links.map((link) => (
                    <tr key={link.code}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        <a
                          href={link.targeturl}
                          onClick={() => updateClickStats(link.code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {link.code}
                        </a>

                        <button
                          onClick={() =>
                            copyToClipboard(`${baseUrl}/${link.code}`)
                          }
                          title="Copy Short Link"
                          className="ml-2 text-gray-400 hover:text-gray-600 functional copy button [cite: 47]"
                        >
                          📋
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                        {link.targeturl}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.totalClicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(link.lastClicked)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
