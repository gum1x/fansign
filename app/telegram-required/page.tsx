export default function TelegramRequiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md text-center bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700/30">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Telegram App Required</h2>
        <p className="mb-4">
          This application is designed to work inside the Telegram app. Please open this link using the Telegram app.
        </p>
        <div className="bg-gray-900 p-4 rounded text-sm text-gray-300 mb-4">
          <p>If you're already in Telegram, try refreshing the page or opening it again.</p>
        </div>
        <a
          href="https://t.me/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Open Telegram
        </a>
      </div>
    </div>
  )
}
