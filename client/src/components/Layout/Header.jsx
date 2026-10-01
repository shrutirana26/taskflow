import { HiOutlineMenuAlt2 } from 'react-icons/hi';

export default function Header({ title, subtitle, onMenuClick, children }) {
  return (
    <header className="sticky top-0 z-30 glass-light px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-surface-400 hover:text-white transition-colors"
          >
            <HiOutlineMenuAlt2 className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </header>
  );
}
