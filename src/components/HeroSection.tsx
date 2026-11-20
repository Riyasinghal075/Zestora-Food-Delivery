import { MapPin, Search, Clock, Star, ShieldCheck, Bike } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { NEIGHBORHOODS } from '../data/restaurants';
import type { CuisineCategory } from '../data/restaurants';
import { FoodImage } from './FoodImage';

interface HeroSectionProps {
  selectedNeighborhood: string;
  onNeighborhoodChange: (neighborhood: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickCategory: (category: CuisineCategory) => void;
  onSearchSubmit: () => void;
}

const QUICK_CRAVINGS: CuisineCategory[] = [
  'Biryani',
  'Pizza',
  'Burgers',
  'Healthy Bowls',
];

const HERO_BENEFITS = [
  {
    icon: Clock,
    title: '15–25 Min Delivery',
    detail: 'Fresh from nearby kitchens',
  },
  {
    icon: Star,
    title: '4.8★ Top Kitchens',
    detail: 'Handpicked local favorites',
  },
  {
    icon: Bike,
    title: 'Live Order Tracking',
    detail: 'Follow every step to your door',
  },
  {
    icon: ShieldCheck,
    title: 'Clear Honest Pricing',
    detail: 'Zero hidden packaging surprises',
  },
];

export function HeroSection({
  selectedNeighborhood,
  onNeighborhoodChange,
  searchQuery,
  onSearchChange,
  onQuickCategory,
  onSearchSubmit,
}: HeroSectionProps) {
  const prefersReduced = useReducedMotion();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <section id="top" className="bg-white border-b border-zinc-200/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-10 lg:pt-12 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Editorial Headline + Zomato/Swiggy Style Unified Search */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center py-2"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D9381E] mb-3">
              Neighborhood Express Delivery · 20 Mins Average
            </p>

            <h1
              className="font-display font-extrabold tracking-tight text-zinc-900 leading-[1.1] mb-4"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              Crave-worthy meals, delivered hot to your door.
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl mb-7">
              Discover handpicked neighborhood kitchens, customize dishes effortlessly,
              and track your meal from kitchen stove to your doorstep.
            </p>

            {/* Unified Location + Food Search Bar */}
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col sm:flex-row items-stretch bg-white border border-zinc-300 rounded-xl shadow-sm p-1.5 gap-1.5 focus-within:border-[#D9381E] focus-within:ring-2 focus-within:ring-[#D9381E]/15 transition-all"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 sm:w-[42%] border-b sm:border-b-0 sm:border-r border-zinc-200">
                <MapPin className="w-4 h-4 text-[#D9381E] shrink-0" />
                <label htmlFor="neighborhood-select" className="sr-only">
                  Delivery neighborhood
                </label>
                <select
                  id="neighborhood-select"
                  value={selectedNeighborhood}
                  onChange={(e) => onNeighborhoodChange(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-zinc-800 focus:outline-none truncate cursor-pointer"
                >
                  {NEIGHBORHOODS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2.5 flex-1">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <label htmlFor="hero-food-search" className="sr-only">
                  Search for dishes or restaurants
                </label>
                <input
                  id="hero-food-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search biryani, pizza, burgers..."
                  className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#D9381E] hover:bg-[#BE2E17] active:scale-[0.99] text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                Find Food
              </button>
            </form>

            {/* Quick Craving Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-zinc-500">
              <span className="font-medium text-zinc-500 mr-1">Popular right now:</span>
              {QUICK_CRAVINGS.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => onQuickCategory(cuisine)}
                  className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Full-Bleed Appetizing Feast Photography */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/70"
          >
            <FoodImage
              src="/src/assets/images/hero_feast_table_1795191595228.jpg"
              alt="Fresh wood-fired pizza, saffron biryani bowl, and gourmet smash burger on a sunlit table"
              className="w-full h-full lg:h-full object-cover"
              fallbackTitle="Signature Neighborhood Spread"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
              <div>
                <p className="text-xs font-medium text-white/80 mb-0.5">
                  Prepared fresh on order
                </p>
                <p className="font-display text-lg font-bold tracking-tight">
                  6 Curated Kitchens · {selectedNeighborhood.split(',')[0]}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/25 whitespace-nowrap shrink-0">
                WELCOME20 · 20% Off
              </span>
            </div>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Service Promise Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-200/80">
          {HERO_BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.1 + index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-start gap-3 p-2"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#D9381E] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 leading-snug">
                    {benefit.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                    {benefit.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
