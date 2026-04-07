import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Network, Pencil, Share2, Shield, Zap, Layers } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">akdraw</span>
          </div>
          
          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  My Canvases
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
                <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Infinite Canvas for<span className="text-primary-600 block mt-2">Network Engineers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Combine the power of Excalidraw, OneNote, and CherryTree. Draw network diagrams, document CLI commands, collaborate in real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-8 py-4 bg-primary-600 text-white text-lg rounded-xl hover:bg-primary-700 shadow-lg">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-8 py-4 bg-primary-600 text-white text-lg rounded-xl hover:bg-primary-700 shadow-lg">
                  Start Free
                </Link>
                <Link to="/login" className="px-8 py-4 bg-white text-gray-700 text-lg rounded-xl border-2 hover:border-gray-300">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need for network documentation
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<Pencil />} title="Hand-drawn Style" description="Beautiful sketchy diagrams with Rough.js integration." />
            <FeatureCard icon={<Layers />} title="Smart CLI Boxes" description="Auto-detect and format CLI commands with syntax highlighting." />
            <FeatureCard icon={<Zap />} title="Canvas Autocomplete" description="Suggestions based on words already on your canvas." />
            <FeatureCard icon={<Share2 />} title="Real-time Collaboration" description="Work together with your team in real-time." />
            <FeatureCard icon={<Shield />} title="Privacy First" description="Your data stays yours with end-to-end encryption." />
            <FeatureCard icon={<Network />} title="Network Shapes" description="Built-in library of network-specific shapes." />
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-gray-900">akdraw</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 akdraw. Built for network engineers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
