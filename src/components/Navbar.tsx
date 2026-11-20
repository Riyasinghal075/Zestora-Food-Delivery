import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeOrderCount: number;
}

export function Navbar({ cartCount, onOpenCart, activeOrderCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9381E] rounded"
        >
          Zestora
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          <a
            href="#explore"
            className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#D9381E]"
          >
            Explore
          </a>
          <a
            href="#cuisines"
            className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#D9381E]"
          >
            Cuisines
          </a>
          <a
            href="#track"
            className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#D9381E]"
          >
            Track Order{activeOrderCount > 0 ? ` (${activeOrderCount})` : ''}
          </a>
          <a
            href="#how-it-works"
            className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#D9381E]"
          >
            How It Works
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#D9381E] hover:bg-[#BE2E17] active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D9381E]"
            aria-label={`Open cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="tabular-nums">Cart ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
