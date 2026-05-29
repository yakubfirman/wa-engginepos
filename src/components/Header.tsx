import { Phone, Settings, MessageSquare } from 'lucide-react';

type Page = 'home' | 'settings';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-800">WA Engine</h1>
            <p className="text-xs text-stone-500">GreenPOS Integration</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ${
              currentPage === 'home'
                ? 'bg-primary-50 text-primary-700'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Pesan</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ${
              currentPage === 'settings'
                ? 'bg-primary-50 text-primary-700'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
