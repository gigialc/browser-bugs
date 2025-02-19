import { ReactNode } from 'react';
import Link from 'next/link';
import { Settings, TestTube } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPath: string;
}

export default function Layout({ children, currentPath }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[#0a0b14]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f1016] text-white p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Test Flow</h1>
          <p className="text-sm text-gray-400">Frontend Testing Platform</p>
        </div>
        
        <nav className="space-y-2">
          <Link 
            href="/tests" 
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              currentPath === '/tests' 
                ? 'bg-[#1e2d97] text-white' 
                : 'text-gray-300 hover:bg-[#1a1b23]'
            }`}
          >
            <TestTube className="w-5 h-5" />
            <span>Test Flows</span>
          </Link>
          <Link 
            href="/settings" 
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              currentPath === '/settings' 
                ? 'bg-[#1e2d97] text-white' 
                : 'text-gray-300 hover:bg-[#1a1b23]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-6 bg-[#0f1016]">
          <div className="text-sm text-gray-400">gigi@apofis.com</div>
          <button className="mt-2 text-gray-300 hover:text-white">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
} 