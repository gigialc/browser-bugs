'use client';

import Link from "next/link";
import { useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-gray-900 text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-10
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-gray-900 text-white flex flex-col
      `}>
        <div className="p-4">
          <h1 className="text-xl font-bold mb-1">Browser Bugs</h1>
          <p className="text-sm text-gray-400">Automated UI testing platform</p>
        </div>
        
        <nav className="mt-6">
          <Link 
            href="/tests" 
            className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Test Flows</span>
          </Link>
          <Link 
            href="/settings" 
            className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Settings</span>
          </Link>
        </nav>

        {/* Logout Section */}
        <div className="mt-auto p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2">gigi@apofis.com</div>
          <button className="text-gray-300 hover:text-white">
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-0"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-white p-4 lg:p-8 w-full">
        <div className="max-w-6xl mx-auto pt-12 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
} 