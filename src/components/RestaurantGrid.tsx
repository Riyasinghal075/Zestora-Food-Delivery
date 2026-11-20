import { ArrowRight, SlidersHorizontal, Star, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CUISINE_CATEGORIES } from '../data/restaurants';
import type { CuisineCategory, Restaurant } from '../data/restaurants';
import { FoodImage } from './FoodImage';

export type SortOption = 'recommended' | 'fastest' | 'rating' | 'cost_asc';

interface RestaurantGridProps {
  restaurants: Restaurant[];
  selectedCuisine: CuisineCategory;
  onSelectCuisine: (cuisine: CuisineCategory) => void;
  vegOnly: boolean;
  onToggleVegOnly: () => void;
  fastDeliveryOnly: boolean;
  onToggleFastDelivery: () => void;
  topRatedOnly: boolean;
  onToggleTopRated: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onClearFilters: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  cartRestaurantId: string | null;
  cartCount: number;
}

export function RestaurantGrid({
  restaurants,
  selectedCuisine,
  onSelectCuisine,
  vegOnly,
  onToggleVegOnly,
  fastDeliveryOnly,
  onToggleFastDelivery,
  topRatedOnly,
  onToggleTopRated,
  sortBy,
  onSortChange,
  searchQuery,
  onClearFilters,
  onSelectRestaurant,
  cartRestaurantId,
  cartCount,
}: RestaurantGridProps) {
  const prefersReduced = useReducedMotion();

  const hasActiveFilters =
    selectedCuisine !== 'All' ||
    vegOnly ||
    fastDeliveryOnly ||
    topRatedOnly ||
    searchQuery.trim().length > 0;

  return (
    <section id="explore" className="py-10 lg:py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Curated Local Kitchens
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Explore restaurants near you
            </h2>
          </div>
          <p className="text-sm text-zinc-500 tabular-nums">
            Showing {restaurants.length} {restaurants.length === 1 ? 'kitchen' : 'kitchens'}
          </p>
        </div>

        {/* Cuisine Category Ribbon (#cuisines) */}
        <div
          id="cuisines"
          className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 border-b border-zinc-200/80"
          role="tablist"
          aria-label="Filter by cuisine"
        >
          {CUISINE_CATEGORIES.map((cuisine) => {
            const isActive = selectedCuisine === cuisine;
            return (
              <button
                key={cuisine}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectCuisine(cuisine)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters:
            </span>

            <button
              type="button"
              onClick={onToggleVegOnly}
              aria-pressed={vegOnly}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
            >
              Pure Veg
            </button>

            <button
              type="button"
              onClick={onToggleFastDelivery}
              aria-pressed={fastDeliveryOnly}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                fastDeliveryOnly
                  ? 'bg-orange-50 border-[#D9381E] text-[#D9381E]'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
            >
              Under 22 mins
            </button>

            <button
              type="button"
              onClick={onToggleTopRated}
              aria-pressed={topRatedOnly}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                topRatedOnly
                  ? 'bg-amber-50 border-amber-600 text-amber-800'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
            >
              Rating 4.8+
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer whitespace-nowrap shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-restaurants" className="text-xs font-medium text-zinc-500">
              Sort by:
            </label>
            <select
              id="sort-restaurants"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-[#D9381E] cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="fastest">Fastest Delivery</option>
              <option value="rating">Highest Rated</option>
              <option value="cost_asc">Cost: Low to High</option>
            </select>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        {restaurants.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
            <p className="font-display text-lg font-semibold text-zinc-900 mb-1">
              No kitchens match your current filters
            </p>
            <p className="text-sm text-zinc-500 mb-5">
              Try clearing a filter or searching for another dish like Biryani, Pizza, or Bowls.
            </p>
            <button
              type="button"
              onClick={onClearFilters}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#D9381E] hover:bg-[#BE2E17] rounded-lg transition-colors cursor-pointer"
            >
              Show All Kitchens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {restaurants.map((restaurant, idx) => {
              const hasItemsInCart =
                cartRestaurantId === restaurant.id && cartCount > 0;

              return (
                <motion.article
                  key={restaurant.id}
                  initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(idx * 0.05, 0.2),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-zinc-300"
                >
                  <button
                    type="button"
                    onClick={() => onSelectRestaurant(restaurant)}
                    className="text-left flex flex-col flex-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9381E]"
                  >
                    {/* Image Zone (65%+ visual weight) */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                      <FoodImage
                        src={restaurant.image}
                        alt={restaurant.name}
                        fallbackTitle={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
                        <span className="text-xs font-semibold tracking-tight drop-shadow-sm">
                          {restaurant.offerText}
                        </span>
                        {hasItemsInCart && (
                          <span className="text-xs font-semibold bg-[#D9381E] px-2.5 py-0.5 rounded-md">
                            {cartCount} in cart
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Zone: Unboxed Clean Typography */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 mb-1.5">
                        <span className="uppercase tracking-wide font-medium truncate">
                          {restaurant.cuisine} · {restaurant.distanceKm.toFixed(1)} km
                        </span>
                        {restaurant.isPureVeg && (
                          <span className="text-emerald-700 font-medium whitespace-nowrap shrink-0">
                            Pure Veg
                          </span>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="font-display text-lg font-bold text-zinc-900 leading-snug group-hover:text-[#D9381E] transition-colors">
                          {restaurant.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-900 tabular-nums shrink-0 pt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {restaurant.rating.toFixed(1)}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 mb-3 truncate">
                        {restaurant.cuisinesLabel}
                      </p>

                      <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600 tabular-nums">
                        <span>
                          {restaurant.deliveryTimeLabel} · ₹{restaurant.costForTwo} for two
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#D9381E] whitespace-nowrap shrink-0">
                          Menu
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
