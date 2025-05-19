export default function AdminDebugToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/debug-redeem" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Debug Key Redemption</h2>
          <p className="text-gray-600">
            Troubleshoot key redemption issues with detailed diagnostics and step-by-step logging.
          </p>
          <div className="mt-4 text-blue-600 font-medium">Open Debug Redeem →</div>
        </a>

        <a href="/debug-database" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Database Diagnostics</h2>
          <p className="text-gray-600">Check database connection status and verify table structure and data.</p>
          <div className="mt-4 text-blue-600 font-medium">Open Database Diagnostics →</div>
        </a>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">About Debug Tools</h3>
        <p>
          These tools are designed to help troubleshoot issues with the Fansign Generator application. They provide
          detailed diagnostics and logging to identify and fix problems.
        </p>
      </div>

      <div className="mt-6 text-center">
        <a
          href="https://t.me/fansignpreviews"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Check out our Telegram preview channel
        </a>
      </div>
    </div>
  )
}
