export const dynamic = "force-dynamic";

export default function DebugEnvPage() {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;
  const vercelGitBranch = process.env.VERCEL_GIT_COMMIT_REF;

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Environment Debug Info</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Data</h2>
            <p className="text-sm text-gray-700">
              Players and tournaments use <strong>in-memory mock data</strong>.
              Manage them via the admin panel at{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">/admin</code>.
            </p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Vercel</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">VERCEL_ENV:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {vercelEnv || "NOT SET"}
                </code>
              </p>
              <p>
                <span className="font-medium">VERCEL_URL:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {vercelUrl || "NOT SET"}
                </code>
              </p>
              <p>
                <span className="font-medium">Git Branch:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {vercelGitBranch || "NOT SET"}
                </code>
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded p-4 text-sm">
            <p className="text-green-800">
              No database required. Optional: Cloudinary env vars for image
              uploads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
