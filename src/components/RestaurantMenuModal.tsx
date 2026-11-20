import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Search, ShoppingBag, Star, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type {
  CartItem,
  MenuItem,
  MenuItemVariant,
  Restaurant,
} from '../data/restaurants';
import { FoodImage } from './FoodImage';

interface RestaurantMenuModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  cartItems: CartItem[];
  cartRestaurantId: string | null;
  onAddItem: (
    restaurant: Restaurant,
    item: MenuItem,
    variant?: MenuItemVariant,
    replaceExisting?: boolean
  ) => void;
  onUpdateQuantity: (cartKey: string, delta: number) => void;
  onOpenCart: () => void;
}

export function RestaurantMenuModal({
  restaurant,
  onClose,
  cartItems,
  cartRestaurantId,
  onAddItem,
  onUpdateQuantity,
  onOpenCart,
}: RestaurantMenuModalProps) {
  const prefersReduced = useReducedMotion();
  const [dishQuery, setDishQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [pendingConflict, setPendingConflict] = useState<{
    item: MenuItem;
    variant?: MenuItemVariant;
  } | null>(null);

  useEffect(() => {
    setDishQuery('');
    setVegFilter(false);
    setPendingConflict(null);
  }, [restaurant?.id]);

  useEffect(() => {
    if (!restaurant) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [restaurant, onClose]);

  const filteredMenu = useMemo(() => {
    if (!restaurant) return [];
    const q = dishQuery.trim().toLowerCase();
    return restaurant.menu.filter((item) => {
      if (vegFilter && !item.isVeg) return false;
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [restaurant, dishQuery, vegFilter]);

  if (!restaurant) return null;

  const getActiveVariant = (item: MenuItem): MenuItemVariant | undefined => {
    if (!item.variants || item.variants.length === 0) return undefined;
    const chosenId = selectedVariants[item.id];
    return item.variants.find((v) => v.id === chosenId) || item.variants[0];
  };

  const getCartKey = (item: MenuItem, variant?: MenuItemVariant) =>
    `${restaurant.id}::${item.id}::${variant?.id || 'default'}`;

  const handleAddClick = (item: MenuItem) => {
    const variant = getActiveVariant(item);
    if (
      cartRestaurantId &&
      cartRestaurantId !== restaurant.id &&
      cartItems.length > 0
    ) {
      setPendingConflict({ item, variant });
      return;
    }
    onAddItem(restaurant, item, variant, false);
  };

  const currentRestCartCount = cartItems
    .filter((c) => c.restaurantId === restaurant.id)
    .reduce((sum, c) => sum + c.quantity, 0);

  const currentRestCartTotal = cartItems
    .filter((c) => c.restaurantId === restaurant.id)
    .reduce(
      (sum, c) =>
        sum + (c.menuItem.price + (c.variant?.priceDelta || 0)) * c.quantity,
      0
    );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-menu-title"
      >
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? undefined : { opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-3xl max-h-[92vh] sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col shadow-2xl border border-zinc-200"
        >
          {/* Restaurant Header Banner */}
          <div className="relative h-44 sm:h-52 w-full bg-zinc-900 shrink-0">
            <FoodImage
              src={restaurant.image}
              alt={restaurant.name}
              fallbackTitle={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close restaurant menu"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center shadow transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-4 left-5 right-5 text-white">
              <p className="text-xs font-medium text-white/80 mb-1">
                {restaurant.cuisinesLabel} · {restaurant.neighborhood}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="restaurant-menu-title"
                  className="font-display text-2xl sm:text-3xl font-bold tracking-tight"
                >
                  {restaurant.name}
                </h2>
                <div className="flex items-center gap-3 text-sm font-semibold tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {restaurant.rating.toFixed(1)} ({restaurant.ratingCount})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{restaurant.deliveryTimeLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Search & Veg Filter Bar */}
          <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dishQuery}
                onChange={(e) => setDishQuery(e.target.value)}
                placeholder="Search dishes in this menu..."
                aria-label="Search dishes in menu"
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#D9381E]"
              />
            </div>

            <button
              type="button"
              onClick={() => setVegFilter((v) => !v)}
              aria-pressed={vegFilter}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                vegFilter
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
            >
              Veg Dishes Only
            </button>
          </div>

          {/* Conflict Banner if switching restaurant cart */}
          {pendingConflict && (
            <div className="mx-5 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-sm text-amber-950">
                <p className="font-semibold">Replace items from previous kitchen?</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your cart currently has items from another restaurant. Starting a basket from{' '}
                  {restaurant.name} will clear the previous selection.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPendingConflict(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Keep Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddItem(
                      restaurant,
                      pendingConflict.item,
                      pendingConflict.variant,
                      true
                    );
                    setPendingConflict(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#D9381E] hover:bg-[#BE2E17] rounded-lg cursor-pointer"
                >
                  Replace & Add
                </button>
              </div>
            </div>
          )}

          {/* Dish List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-zinc-100">
            {filteredMenu.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                No dishes match your search in this kitchen.
              </div>
            ) : (
              filteredMenu.map((item) => {
                const activeVariant = getActiveVariant(item);
                const unitPrice =
                  item.price + (activeVariant?.priceDelta || 0);
                const cartKey = getCartKey(item, activeVariant);
                const existingEntry = cartItems.find(
                  (c) => c.cartKey === cartKey
                );

                return (
                  <div
                    key={item.id}
                    className="py-4 first:pt-1 last:pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Universal Dietary Indicator + Text Label */}
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border ${
                            item.isVeg
                              ? 'border-emerald-600'
                              : 'border-red-600'
                          }`}
                          aria-label={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                        {item.isBestseller && (
                          <>
                            <span aria-hidden="true" className="text-zinc-300">
                              ·
                            </span>
                            <span className="text-xs font-semibold text-[#D9381E]">
                              Bestseller
                            </span>
                          </>
                        )}
                        {item.calories && (
                          <>
                            <span aria-hidden="true" className="text-zinc-300">
                              ·
                            </span>
                            <span className="text-xs text-zinc-400 tabular-nums">
                              {item.calories}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-base font-bold text-zinc-900">
                        {item.name}
                      </h3>

                      <p className="text-sm font-semibold text-zinc-900 tabular-nums mt-0.5">
                        ₹{unitPrice}
                      </p>

                      <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Optional Portion / Variant Selector */}
                      {item.variants && item.variants.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {item.variants.map((variant) => {
                            const isSelected = activeVariant?.id === variant.id;
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [item.id]: variant.id,
                                  }))
                                }
                                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                                }`}
                              >
                                {variant.label}
                                {variant.priceDelta > 0
                                  ? ` (+₹${variant.priceDelta})`
                                  : ''}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Add / Quantity Stepper */}
                    <div className="shrink-0 sm:pt-1">
                      {existingEntry ? (
                        <div className="inline-flex items-center border border-[#D9381E] rounded-lg bg-orange-50/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartKey, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="px-3 py-2 text-[#D9381E] hover:bg-orange-100/80 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-bold text-[#D9381E] tabular-nums min-w-[32px] text-center">
                            {existingEntry.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartKey, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="px-3 py-2 text-[#D9381E] hover:bg-orange-100/80 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddClick(item)}
                          className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-[#D9381E] bg-white border border-zinc-300 hover:border-[#D9381E] hover:bg-orange-50/50 rounded-lg transition-all cursor-pointer shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Cart Bar inside Menu */}
          {currentRestCartCount > 0 && (
            <div className="px-5 py-3.5 bg-[#D9381E] text-white flex items-center justify-between gap-4 shrink-0">
              <div className="text-sm font-semibold tabular-nums">
                {currentRestCartCount}{' '}
                {currentRestCartCount === 1 ? 'item' : 'items'} added · ₹
                {currentRestCartTotal}
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#D9381E] text-sm font-bold rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                View Cart & Checkout
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
