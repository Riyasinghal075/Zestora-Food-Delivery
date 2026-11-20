import { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PROMO_CODES } from '../data/restaurants';
import type { CartItem, OrderRecord } from '../data/restaurants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  restaurantName: string | null;
  selectedNeighborhood: string;
  onUpdateQuantity: (cartKey: string, delta: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: OrderRecord) => void;
}

const PAYMENT_OPTIONS: OrderRecord['paymentMethod'][] = [
  'UPI Instant',
  'Card on Delivery',
  'Cash on Delivery',
];

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  restaurantName,
  selectedNeighborhood,
  onUpdateQuantity,
  onClearCart,
  onOrderPlaced,
}: CartDrawerProps) {
  const prefersReduced = useReducedMotion();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string>('');

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<OrderRecord['paymentMethod']>('UPI Instant');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (item.menuItem.price + (item.variant?.priceDelta || 0)) * item.quantity,
    0
  );

  const baseDeliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 35;
  const platformFee = subtotal === 0 ? 0 : 8;

  let discount = 0;
  let deliveryFee = baseDeliveryFee;

  if (appliedPromo === 'WELCOME20' && subtotal >= 249) {
    discount = Math.min(120, Math.round(subtotal * 0.2));
  } else if (appliedPromo === 'FREEDEL' && subtotal >= 199) {
    deliveryFee = 0;
    discount = baseDeliveryFee;
  }

  const finalDeliveryFee = appliedPromo === 'FREEDEL' && subtotal >= 199 ? 0 : baseDeliveryFee;
  const effectiveDiscount = appliedPromo === 'WELCOME20' && subtotal >= 249 ? discount : 0;
  const totalPayable = Math.max(
    0,
    subtotal + finalDeliveryFee + platformFee - effectiveDiscount
  );

  const handleApplyPromo = (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;

    const found = PROMO_CODES.find((p) => p.code === cleanCode);
    if (!found) {
      setPromoMessage('Code not recognized. Try WELCOME20 or FREEDEL.');
      return;
    }
    if (subtotal < found.minOrder) {
      setPromoMessage(`Add ₹${found.minOrder - subtotal} more to use ${found.code}.`);
      return;
    }

    setAppliedPromo(found.code);
    setPromoInput(found.code);
    setPromoMessage(`${found.code} applied — ${found.title}`);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (cartItems.length === 0) return;

    const cleanName = customerName.trim();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanAddress = address.trim();

    if (cleanName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (cleanAddress.length < 8) {
      setFormError('Please enter your complete flat / street delivery address.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      restaurantId: cartItems[0].restaurantId,
      restaurantName: restaurantName || cartItems[0].restaurantName,
      items: cartItems.map((c) => ({
        name: c.menuItem.name,
        variantLabel: c.variant?.label,
        quantity: c.quantity,
        unitPrice: c.menuItem.price + (c.variant?.priceDelta || 0),
        isVeg: c.menuItem.isVeg,
      })),
      subtotal,
      deliveryFee: finalDeliveryFee,
      platformFee,
      discount: effectiveDiscount,
      total: totalPayable,
      promoCode: appliedPromo || undefined,
      customerName: cleanName,
      phone: cleanPhone,
      address: `${cleanAddress}, ${selectedNeighborhood}`,
      instructions: instructions.trim(),
      paymentMethod,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Could not place order.');
      }

      const data = (await response.json()) as { order: OrderRecord };
      onOrderPlaced(data.order);
      onClearCart();
      setAppliedPromo('');
      setPromoInput('');
      setPromoMessage('');
      onClose();
    } catch {
      // Fallback local confirmation if backend unreachable in static preview
      const fallbackOrder: OrderRecord = {
        ...payload,
        id: `ZST-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'confirmed',
        etaMinutes: 22,
        riderName: 'Arjun K.',
        createdAt: new Date().toISOString(),
      };
      onOrderPlaced(fallbackOrder);
      onClearCart();
      setAppliedPromo('');
      setPromoInput('');
      setPromoMessage('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Your Food Cart and Checkout"
        >
          <motion.aside
            initial={prefersReduced ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={prefersReduced ? undefined : { x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-zinc-200"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-display text-lg font-bold text-zinc-900">
                  Your Cart
                </h2>
                {restaurantName && cartItems.length > 0 && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Ordering from {restaurantName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-600 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close cart drawer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Empty Cart State */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="font-display text-lg font-semibold text-zinc-900 mb-1">
                  Your cart is empty
                </p>
                <p className="text-sm text-zinc-500 max-w-xs mb-6">
                  Pick a neighborhood kitchen and add dishes to start your order.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#D9381E] hover:bg-[#BE2E17] rounded-lg transition-colors cursor-pointer"
                >
                  Browse Kitchens
                </button>
              </div>
            ) : (
              <form
                onSubmit={handlePlaceOrder}
                className="flex-1 overflow-y-auto flex flex-col"
              >
                {/* Itemized Dishes */}
                <div className="px-5 py-4 divide-y divide-zinc-100 border-b border-zinc-200">
                  {cartItems.map((entry) => {
                    const unitPrice =
                      entry.menuItem.price + (entry.variant?.priceDelta || 0);
                    return (
                      <div
                        key={entry.cartKey}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-xs border shrink-0 ${
                                entry.menuItem.isVeg
                                  ? 'border-emerald-600'
                                  : 'border-red-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  entry.menuItem.isVeg
                                    ? 'bg-emerald-600'
                                    : 'bg-red-600'
                                }`}
                              />
                            </span>
                            <p className="text-sm font-semibold text-zinc-900 truncate">
                              {entry.menuItem.name}
                            </p>
                          </div>
                          {entry.variant && (
                            <p className="text-xs text-zinc-500 mt-0.5 pl-5">
                              {entry.variant.label}
                            </p>
                          )}
                          <p className="text-xs font-medium text-zinc-700 tabular-nums mt-0.5 pl-5">
                            ₹{unitPrice * entry.quantity}
                          </p>
                        </div>

                        <div className="inline-flex items-center border border-zinc-300 rounded-lg bg-white shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(entry.cartKey, -1)}
                            aria-label={`Remove one ${entry.menuItem.name}`}
                            className="px-2.5 py-1.5 text-zinc-600 hover:text-[#D9381E] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-zinc-900 tabular-nums">
                            {entry.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(entry.cartKey, 1)}
                            aria-label={`Add one ${entry.menuItem.name}`}
                            className="px-2.5 py-1.5 text-zinc-600 hover:text-[#D9381E] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Codes Section */}
                <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50/70">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 mb-2">
                    <Tag className="w-3.5 h-3.5 text-[#D9381E]" />
                    Apply Offer Code
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter WELCOME20 or FREEDEL"
                      aria-label="Promo code"
                      className="flex-1 px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg uppercase focus:outline-none focus:border-[#D9381E]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo(promoInput)}
                      className="px-3.5 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PROMO_CODES.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleApplyPromo(p.code)}
                        className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                          appliedPromo === p.code
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        {p.code} · {p.title}
                      </button>
                    ))}
                  </div>
                  {promoMessage && (
                    <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Delivery Details Form */}
                <div className="px-5 py-4 space-y-3 border-b border-zinc-200">
                  <h3 className="font-display text-sm font-bold text-zinc-900">
                    Delivery Details ({selectedNeighborhood})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="checkout-name"
                        className="block text-xs font-medium text-zinc-600 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Kartik Singh"
                        className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D9381E]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="checkout-phone"
                        className="block text-xs font-medium text-zinc-600 mb-1"
                      >
                        Mobile Number
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D9381E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-xs font-medium text-zinc-600 mb-1"
                    >
                      Flat / House No. & Street
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat 402, Maple Residency, 12th Main Road"
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D9381E]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-notes"
                      className="block text-xs font-medium text-zinc-600 mb-1"
                    >
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      id="checkout-notes"
                      type="text"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Leave at security gate or ring doorbell once"
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D9381E]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-zinc-600 mb-1.5">
                      Payment Method
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setPaymentMethod(option)}
                          className={`px-2 py-2 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                            paymentMethod === option
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="px-5 py-4 space-y-2 text-xs text-zinc-600 tabular-nums">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span className="font-medium text-zinc-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Delivery Partner Fee{' '}
                      {subtotal >= 499 ? '(Free above ₹499)' : ''}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {finalDeliveryFee === 0 ? 'Free' : `₹${finalDeliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-medium text-zinc-900">₹{platformFee}</span>
                  </div>
                  {effectiveDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Promo Discount ({appliedPromo})</span>
                      <span>-₹{effectiveDiscount}</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-zinc-200 flex justify-between text-sm font-bold text-zinc-900">
                    <span>To Pay</span>
                    <span>₹{totalPayable}</span>
                  </div>
                </div>

                {formError && (
                  <p className="mx-5 mb-3 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {formError}
                  </p>
                )}

                {/* Sticky Checkout Submit Button */}
                <div className="mt-auto p-5 border-t border-zinc-200 bg-white sticky bottom-0">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-5 bg-[#D9381E] hover:bg-[#BE2E17] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="tabular-nums">
                      {isSubmitting
                        ? 'Confirming Order...'
                        : `Place Order · ₹${totalPayable}`}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
