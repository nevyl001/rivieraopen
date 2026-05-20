export const dynamic = "force-dynamic";

export default function DebugEnvPage() {
  const env = process.env.NEXT_PUBLIC_ENV;
  const hasDbUrl = !!process.env.DATABASE_URL;
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;
  const vercelGitBranch = process.env.VERCEL_GIT_COMMIT_REF;

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Environment Debug Info</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">
              Application Environment
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">NEXT_PUBLIC_ENV:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {env || "NOT SET"}
                </code>
              </p>
              <p>
                <span className="font-medium">DATABASE_URL:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {hasDbUrl ? "SET ✅" : "NOT SET ❌"}
                </code>
              </p>
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Vercel Environment</h2>
            <div className="space-y-2">
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

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold mb-2">Expected Values:</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <strong>Production (rivieraopen.com):</strong>
                <ul className="ml-4 mt-1">
                  <li>• NEXT_PUBLIC_ENV = "prod"</li>
                  <li>• DATABASE_URL = SET</li>
                  <li>• VERCEL_ENV = "production"</li>
                  <li>• Git Branch = "main"</li>
                </ul>
              </li>
              <li className="mt-2">
                <strong>Preview (riviera-open-web.vercel.app):</strong>
                <ul className="ml-4 mt-1">
                  <li>• NEXT_PUBLIC_ENV = "dev"</li>
                  <li>• DATABASE_URL = NOT SET</li>
                  <li>• VERCEL_ENV = "preview"</li>
                  <li>• Git Branch = "development"</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-semibold mb-2">Current Behavior:</h3>
            <p className="text-sm">
              {env === "prod" && hasDbUrl && (
                <span className="text-red-600">
                  ⚠️ Using PRODUCTION environment with database
                </span>
              )}
              {env === "dev" && !hasDbUrl && (
                <span className="text-green-600">
                  ✅ Using DEVELOPMENT environment with mock data
                </span>
              )}
              {env === "dev" && hasDbUrl && (
                <span className="text-orange-600">
                  ⚠️ Using DEVELOPMENT environment but database is configured
                </span>
              )}
              {!env && (
                <span className="text-red-600">
                  ❌ NEXT_PUBLIC_ENV is not set!
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">How to Fix</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Go to Vercel Dashboard → Your Project → Settings → Environment
              Variables
            </li>
            <li>
              For <code className="bg-gray-100 px-1">NEXT_PUBLIC_ENV</code>:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Production: value = "prod" ✓</li>
                <li>• Preview: value = "dev" ✓</li>
                <li>• Development: value = "dev" ✓</li>
              </ul>
            </li>
            <li>
              For <code className="bg-gray-100 px-1">DATABASE_URL</code>:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Production: your Neon URL ✓</li>
                <li>• Preview: leave unchecked ✗</li>
                <li>• Development: leave unchecked ✗</li>
              </ul>
            </li>
            <li>After changing variables, redeploy or push a new commit</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
