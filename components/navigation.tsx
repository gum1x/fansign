"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ImageIcon, Key, User, Menu, X, MessageSquare, ExternalLink, Bug, List } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close the menu when the path changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "/generate", label: "Generate", icon: <ImageIcon className="w-5 h-5" /> },
    { href: "/redeem", label: "Redeem", icon: <Key className="w-5 h-5" /> },
    { href: "/dashboard", label: "Dashboard", icon: <User className="w-5 h-5" /> },
    { href: "/support", label: "Support", icon: <MessageSquare className="w-5 h-5" /> },
  ]

  const debugItems = [
    { href: "/debug-links", label: "Debug Tools", icon: <List className="w-5 h-5" /> },
    { href: "/debug-redeem", label: "Debug Redeem", icon: <Bug className="w-5 h-5" /> },
    { href: "/debug-database", label: "Debug Database", icon: <Bug className="w-5 h-5" /> },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-800 text-white md:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Navigation sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5">
          <h1 className="text-xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Fansign Generator
          </h1>

          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-purple-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}

            <li className="mt-4 pt-4 border-t border-gray-700">
              <a
                href="https://t.me/fansignpreviews"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 rounded-lg text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="ml-3">Fansign Previews</span>
              </a>
            </li>

            {/* Debug section */}
            <li className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 uppercase font-semibold px-2 mb-2">Debug Tools</p>
              {debugItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-red-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </li>
          </ul>
        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
          <a
            href="https://t.me/fansignpreviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Previews on Telegram
          </a>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Main content padding for desktop */}
      <div className="md:pl-64 transition-all duration-300">{/* This is where your page content will go */}</div>
    </>
  )
}
