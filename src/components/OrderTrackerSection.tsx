import {
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  PackageCheck,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { OrderRecord, OrderStatus } from '../data/restaurants';

export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting';

interface OrderTrackerSectionProps {
  orders: OrderRecord[];
  activeOrderId: string | null;
  realtimeState: RealtimeConnectionState;
  onSelectActiveOrder: (orderId: string) => void;
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onReorder: (order: OrderRecord) => void;
}

const TRACKER_STEPS: {
  key: OrderStatus;
  label: string;
  description: string;
  icon: typeof CheckCircle2;
}[] = [
  {
    key: 'confirmed',
    label: 'Order Placed',
    description: 'Kitchen received your order',
    icon: CheckCircle2,
  },
  {
    key: 'preparing',
    label: 'Preparing',
    description: 'Chef is cooking your meal fresh',
    icon: ChefHat,
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Rider is on the way to your door',
    icon: Bike,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Enjoy your meal',
    icon: PackageCheck,
  },
];

function formatTime(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function OrderTrackerSection({
  orders,
  activeOrderId,
  realtimeState,
  onSelectActiveOrder,
  onAdvanceOrderStatus,
  onReorder,
}: OrderTrackerSectionProps) {
  const prefersReduced = useReducedMotion();

  const activeOrder =
    orders.find((o) => o.id === activeOrderId) || orders[0] || null;

  const activeStepIndex = activeOrder
    ? Math.max(0, TRACKER_STEPS.findIndex((s) => s.key === activeOrder.status))
    : 0;

  const nextStatus: OrderStatus | null =
    activeOrder && activeStepIndex < TRACKER_STEPS.length - 1
      ? TRACKER_STEPS[activeStepIndex + 1].key
      : null;

  const currentStep = TRACKER_STEPS[activeStepIndex];

  return (
    <section
      id="track"
      className="py-12 lg:py-16 bg-white border-t border-b border-zinc-200/80"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Real-Time Fulfillment
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                Live Order Tracking
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  realtimeState === 'connected'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                {realtimeState === 'connected'
                  ? 'Live updates connected'
                  : realtimeState === 'connecting'
                  ? 'Connecting live updates...'
                  : 'Reconnecting live updates...'}
              </span>
            </div>
          </div>

          {orders.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="switch-order" className="text-xs font-medium text-zinc-500">
                Viewing order:
              </label>
              <select
                id="switch-order"
                value={activeOrder?.id || ''}
                onChange={(e) => onSelectActiveOrder(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-[#D9381E] cursor-pointer font-mono-tabular"
              >
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    #{ord.id} · {ord.restaurantName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!activeOrder ? (
          <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-zinc-900 mb-1">
              No active orders right now
            </h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-5">
              Once you add dishes to your cart and place an order, status updates from
              Order Placed to Delivered appear here automatically in real time.
            </p>
            <a
              href="#explore"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Browse Kitchens
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Live Tracker Panel */}
            <div className="lg:col-span-8 bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-zinc-200">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-1">
                      <span className="font-mono-tabular font-semibold text-zinc-800">
                        Order #{activeOrder.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeOrder.paymentMethod}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#D9381E]">
                        {currentStep.label}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-zinc-900">
                      {activeOrder.restaurantName}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Delivering to {activeOrder.customerName} · {activeOrder.address}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-zinc-500">
                      {activeOrder.status === 'delivered'
                        ? 'Order Completed'
                        : 'Estimated Arrival'}
                    </p>
                    <p className="font-display text-2xl font-extrabold text-[#D9381E] tabular-nums">
                      {activeOrder.status === 'delivered'
                        ? 'Delivered'
                        : `${activeOrder.etaMinutes} mins`}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Rider: {activeOrder.riderName}
                    </p>
                  </div>
                </div>

                {/* Animated Real-Time Progress Track */}
                <div className="py-7">
                  <div className="relative h-2 bg-zinc-200 rounded-full overflow-hidden mb-7">
                    <motion.div
                      initial={false}
                      animate={{
                        width: `${((activeStepIndex + 1) / TRACKER_STEPS.length) * 100}%`,
                      }}
                      transition={{
                        duration: prefersReduced ? 0 : 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="h-full bg-[#D9381E] rounded-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {TRACKER_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isDone = index <= activeStepIndex;
                      const isCurrent = index === activeStepIndex;
                      const milestoneTime = formatTime(
                        activeOrder.statusHistory?.[step.key] ||
                          (step.key === 'confirmed' ? activeOrder.createdAt : undefined)
                      );

                      return (
                        <motion.div
                          key={step.key}
                          layout={!prefersReduced}
                          className={`p-3.5 rounded-xl border transition-colors ${
                            isCurrent
                              ? 'bg-white border-[#D9381E]/60 shadow-xs'
                              : isDone
                              ? 'bg-white border-zinc-200'
                              : 'bg-zinc-100/60 border-zinc-200/60 opacity-65'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isDone
                                  ? 'bg-[#D9381E] text-white'
                                  : 'bg-zinc-200 text-zinc-500'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            {isDone && milestoneTime && (
                              <span className="text-[11px] font-mono-tabular font-medium text-zinc-500">
                                {milestoneTime}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-zinc-900">
                            {step.label}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                            {step.description}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">
                  {activeOrder.status === 'delivered'
                    ? 'Delivered and verified at your doorstep.'
                    : 'Status updates arrive automatically as the kitchen and rider progress.'}
                </p>
                <div className="flex items-center gap-2">
                  {nextStatus && (
                    <button
                      type="button"
                      onClick={() => onAdvanceOrderStatus(activeOrder.id, nextStatus)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Fast-Forward Stage
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onReorder(activeOrder)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#D9381E] bg-white border border-zinc-300 hover:border-[#D9381E] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reorder Items
                  </button>
                </div>
              </div>
            </div>

            {/* Itemized Receipt Summary */}
            <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col">
              <h3 className="font-display text-base font-bold text-zinc-900 pb-3 border-b border-zinc-200">
                Order Receipt
              </h3>
              <div className="py-4 space-y-2.5 flex-1">
                {activeOrder.items.map((item, i) => (
                  <div
                    key={`${item.name}-${i}`}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-800">
                        {item.quantity} × {item.name}
                      </p>
                      {item.variantLabel && (
                        <p className="text-xs text-zinc-500">{item.variantLabel}</p>
                      )}
                    </div>
                    <span className="font-medium text-zinc-900 tabular-nums shrink-0">
                      ₹{item.unitPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-200 space-y-1.5 text-xs text-zinc-600 tabular-nums">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{activeOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery & Platform Fee</span>
                  <span>₹{activeOrder.deliveryFee + activeOrder.platformFee}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-₹{activeOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-zinc-100 text-sm font-bold text-zinc-900">
                  <span>Total Paid</span>
                  <span>₹{activeOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
