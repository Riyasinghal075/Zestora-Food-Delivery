import { useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CartDrawer } from './components/CartDrawer';
import { HeroSection } from './components/HeroSection';
import { HowItWorksFooter } from './components/HowItWorksFooter';
import { Navbar } from './components/Navbar';
import { OrderTrackerSection } from './components/OrderTrackerSection';
import type { RealtimeConnectionState } from './components/OrderTrackerSection';
import { RestaurantGrid } from './components/RestaurantGrid';
import type { SortOption } from './components/RestaurantGrid';
import { RestaurantMenuModal } from './components/RestaurantMenuModal';
import { NEIGHBORHOODS, RESTAURANTS } from './data/restaurants';
import type {
  CartItem,
  CuisineCategory,
  MenuItem,
  MenuItemVariant,
  OrderRecord,
  OrderStatus,
  Restaurant,
} from './data/restaurants';

const CART_STORAGE_KEY = 'zestora_cart_v1';
const ORDERS_STORAGE_KEY = 'zestora_orders_v1';

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Order Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

type WsIncomingMessage =
  | { type: 'orders:sync'; orders: OrderRecord[] }
  | { type: 'order:created'; order: OrderRecord }
  | { type: 'order:updated'; order: OrderRecord };

function mergeOrdersById(
  serverOrders: OrderRecord[],
  localOrders: OrderRecord[]
): OrderRecord[] {
  const byId = new Map<string, OrderRecord>();
  for (const ord of localOrders) {
    byId.set(ord.id, ord);
  }
  for (const ord of serverOrders) {
    byId.set(ord.id, ord);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function App() {
  const prefersReduced = useReducedMotion();

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(
    NEIGHBORHOODS[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] =
    useState<CuisineCategory>('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(
    null
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [realtimeState, setRealtimeState] =
    useState<RealtimeConnectionState>('connecting');

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as OrderRecord[]) : [];
    } catch {
      return [];
    }
  });

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const activeOrderIdRef = useRef<string | null>(null);
  activeOrderIdRef.current = activeOrderId;

  // Real-time WebSocket connection with automatic reconnection & idempotent handlers
  useEffect(() => {
    let isDisposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
      if (isDisposed) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      setRealtimeState(reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        if (isDisposed) return;
        reconnectAttempts = 0;
        setRealtimeState('connected');
      };

      socket.onmessage = (event) => {
        if (isDisposed) return;
        try {
          const message = JSON.parse(event.data as string) as WsIncomingMessage;

          if (message.type === 'orders:sync') {
            setOrders((prev) => mergeOrdersById(message.orders, prev));
          } else if (message.type === 'order:created') {
            setOrders((prev) => {
              if (prev.some((o) => o.id === message.order.id)) {
                return prev;
              }
              return [message.order, ...prev];
            });
          } else if (message.type === 'order:updated') {
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === message.order.id);
              if (!exists) {
                return [message.order, ...prev];
              }
              return prev.map((o) =>
                o.id === message.order.id ? message.order : o
              );
            });

            if (
              activeOrderIdRef.current === message.order.id ||
              !activeOrderIdRef.current
            ) {
              setToastMessage(
                `Order #${message.order.id}: ${STATUS_LABELS[message.order.status]}`
              );
            }
          }
        } catch {
          // Ignore malformed WS payloads
        }
      };

      socket.onclose = () => {
        if (isDisposed) return;
        setRealtimeState('reconnecting');
        const delayMs = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 8000);
        reconnectAttempts += 1;
        reconnectTimer = setTimeout(connect, delayMs);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = RESTAURANTS.filter((rest) => {
      if (selectedCuisine !== 'All' && rest.cuisine !== selectedCuisine) {
        return false;
      }
      if (vegOnly && !rest.isPureVeg) {
        return false;
      }
      if (fastDeliveryOnly && rest.deliveryMins > 22) {
        return false;
      }
      if (topRatedOnly && rest.rating < 4.8) {
        return false;
      }
      if (q) {
        const matchesRest =
          rest.name.toLowerCase().includes(q) ||
          rest.cuisinesLabel.toLowerCase().includes(q) ||
          rest.cuisine.toLowerCase().includes(q);
        const matchesMenu = rest.menu.some(
          (dish) =>
            dish.name.toLowerCase().includes(q) ||
            dish.description.toLowerCase().includes(q)
        );
        return matchesRest || matchesMenu;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'fastest') {
      sorted.sort((a, b) => a.deliveryMins - b.deliveryMins);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'cost_asc') {
      sorted.sort((a, b) => a.costForTwo - b.costForTwo);
    }

    return sorted;
  }, [
    searchQuery,
    selectedCuisine,
    vegOnly,
    fastDeliveryOnly,
    topRatedOnly,
    sortBy,
  ]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartRestaurantId =
    cartItems.length > 0 ? cartItems[0].restaurantId : null;
  const cartRestaurantName =
    cartItems.length > 0 ? cartItems[0].restaurantName : null;

  const activeOrderCount = orders.filter(
    (o) => o.status !== 'delivered'
  ).length;

  const handleAddItem = (
    restaurant: Restaurant,
    menuItem: MenuItem,
    variant?: MenuItemVariant,
    replaceExisting = false
  ) => {
    const cartKey = `${restaurant.id}::${menuItem.id}::${
      variant?.id || 'default'
    }`;

    setCartItems((prev) => {
      const base = replaceExisting ? [] : prev;
      const idx = base.findIndex((item) => item.cartKey === cartKey);
      if (idx > -1) {
        const updated = [...base];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + 1,
        };
        return updated;
      }
      return [
        ...base,
        {
          cartKey,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          menuItem,
          variant,
          quantity: 1,
        },
      ];
    });

    setToastMessage(`Added ${menuItem.name} to cart`);
  };

  const handleUpdateQuantity = (cartKey: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCuisine('All');
    setVegOnly(false);
    setFastDeliveryOnly(false);
    setTopRatedOnly(false);
    setSortBy('recommended');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOrderPlaced = (newOrder: OrderRecord) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === newOrder.id)) {
        return prev;
      }
      return [newOrder, ...prev];
    });
    setActiveOrderId(newOrder.id);
    setToastMessage(`Order #${newOrder.id} placed`);
    setTimeout(() => scrollToSection('track'), 120);
  };

  const handleAdvanceOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus
  ) => {
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as { order: OrderRecord };
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? data.order : o))
        );
      }
    } catch {
      // Ignore transient network errors; WebSocket reconnects automatically
    }
  };

  const handleReorder = (order: OrderRecord) => {
    const restaurant = RESTAURANTS.find((r) => r.id === order.restaurantId);
    if (!restaurant) return;

    const rebuilt: CartItem[] = [];
    for (const snap of order.items) {
      const menuItem = restaurant.menu.find((m) => m.name === snap.name);
      if (!menuItem) continue;
      const variant = menuItem.variants?.find(
        (v) => v.label === snap.variantLabel
      );
      rebuilt.push({
        cartKey: `${restaurant.id}::${menuItem.id}::${
          variant?.id || 'default'
        }`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        menuItem,
        variant,
        quantity: snap.quantity,
      });
    }

    if (rebuilt.length > 0) {
      setCartItems(rebuilt);
      setIsCartOpen(true);
      setToastMessage(`Loaded items from ${restaurant.name}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900">
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeOrderCount={activeOrderCount}
      />

      <main className="flex-1">
        <HeroSection
          selectedNeighborhood={selectedNeighborhood}
          onNeighborhoodChange={setSelectedNeighborhood}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickCategory={(cuisine) => {
            setSelectedCuisine(cuisine);
            scrollToSection('explore');
          }}
          onSearchSubmit={() => scrollToSection('explore')}
        />

        <RestaurantGrid
          restaurants={filteredRestaurants}
          selectedCuisine={selectedCuisine}
          onSelectCuisine={setSelectedCuisine}
          vegOnly={vegOnly}
          onToggleVegOnly={() => setVegOnly((v) => !v)}
          fastDeliveryOnly={fastDeliveryOnly}
          onToggleFastDelivery={() => setFastDeliveryOnly((v) => !v)}
          topRatedOnly={topRatedOnly}
          onToggleTopRated={() => setTopRatedOnly((v) => !v)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onClearFilters={handleClearFilters}
          onSelectRestaurant={(rest) => setActiveRestaurant(rest)}
          cartRestaurantId={cartRestaurantId}
          cartCount={cartCount}
        />

        <OrderTrackerSection
          orders={orders}
          activeOrderId={activeOrderId}
          realtimeState={realtimeState}
          onSelectActiveOrder={setActiveOrderId}
          onAdvanceOrderStatus={handleAdvanceOrderStatus}
          onReorder={handleReorder}
        />

        <HowItWorksFooter />
      </main>

      {/* Restaurant Menu Modal */}
      <RestaurantMenuModal
        restaurant={activeRestaurant}
        onClose={() => setActiveRestaurant(null)}
        cartItems={cartItems}
        cartRestaurantId={cartRestaurantId}
        onAddItem={handleAddItem}
        onUpdateQuantity={handleUpdateQuantity}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Slide-Over Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        restaurantName={cartRestaurantName}
        selectedNeighborhood={selectedNeighborhood}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Subtle Floating Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-xl border border-zinc-800"
            role="status"
            aria-live="polite"
          >
            <ShoppingBag className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
