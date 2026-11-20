export type CuisineCategory =
  | 'All'
  | 'Biryani'
  | 'Pizza'
  | 'Burgers'
  | 'Sushi & Asian'
  | 'Healthy Bowls'
  | 'Desserts';

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered';

export interface MenuItemVariant {
  id: string;
  label: string;
  priceDelta: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isBestseller?: boolean;
  category: string;
  calories?: string;
  variants?: MenuItemVariant[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: CuisineCategory;
  cuisinesLabel: string;
  rating: number;
  ratingCount: string;
  deliveryMins: number;
  deliveryTimeLabel: string;
  distanceKm: number;
  costForTwo: number;
  offerText: string;
  isPureVeg: boolean;
  neighborhood: string;
  image: string;
  tagline: string;
  menu: MenuItem[];
}

export interface CartItem {
  cartKey: string;
  restaurantId: string;
  restaurantName: string;
  menuItem: MenuItem;
  variant?: MenuItemVariant;
  quantity: number;
}

export interface OrderItemSnapshot {
  name: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  isVeg: boolean;
}

export interface OrderRecord {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  customerName: string;
  phone: string;
  address: string;
  instructions?: string;
  paymentMethod: 'UPI Instant' | 'Card on Delivery' | 'Cash on Delivery';
  status: OrderStatus;
  etaMinutes: number;
  riderName: string;
  createdAt: string;
  statusUpdatedAt?: string;
  statusHistory?: Partial<Record<OrderStatus, string>>;
}

export const NEIGHBORHOODS = [
  'Indiranagar, Bengaluru',
  'Koramangala 4th Block, Bengaluru',
  'Bandra West, Mumbai',
  'Connaught Place, New Delhi',
  'Jubilee Hills, Hyderabad',
] as const;

export const CUISINE_CATEGORIES: CuisineCategory[] = [
  'All',
  'Biryani',
  'Pizza',
  'Burgers',
  'Sushi & Asian',
  'Healthy Bowls',
  'Desserts',
];

export const PROMO_CODES = [
  {
    code: 'WELCOME20',
    title: '20% off up to ₹120',
    description: 'Valid on orders above ₹249',
    minOrder: 249,
    discountPercent: 20,
    maxDiscount: 120,
  },
  {
    code: 'FREEDEL',
    title: 'Zero delivery fee',
    description: 'Free express delivery on any order above ₹199',
    minOrder: 199,
    freeDelivery: true,
  },
] as const;

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-saffron-handi',
    name: 'Saffron Handi Kitchen',
    cuisine: 'Biryani',
    cuisinesLabel: 'Hyderabadi Biryani, North Indian, Kebabs',
    rating: 4.8,
    ratingCount: '2.4k',
    deliveryMins: 22,
    deliveryTimeLabel: '20–25 mins',
    distanceKm: 1.8,
    costForTwo: 550,
    offerText: '20% off with WELCOME20',
    isPureVeg: false,
    neighborhood: 'Indiranagar, Bengaluru',
    image: '/src/assets/images/rest_biryani_house_1795191595336.jpg',
    tagline: 'Slow-cooked clay pot dum biryanis sealed with fragrant basmati and whole spices.',
    menu: [
      {
        id: 'sh-1',
        name: 'Royal Hyderabadi Chicken Dum Biryani',
        description: 'Long-grain aged basmati layered with saffron, crispy birista onions, mint, and slow-braised chicken.',
        price: 349,
        isVeg: false,
        isBestseller: true,
        category: 'Dum Biryanis',
        calories: '680 kcal',
        variants: [
          { id: 'reg', label: 'Regular (Serves 1)', priceDelta: 0 },
          { id: 'handi', label: 'Family Clay Handi (Serves 2)', priceDelta: 240 },
        ],
      },
      {
        id: 'sh-2',
        name: 'Subz Zafrani Paneer Biryani',
        description: 'Char-grilled malai paneer cubes cooked on dum with seasonal vegetables, rose water, and roasted cashews.',
        price: 299,
        isVeg: true,
        isBestseller: true,
        category: 'Dum Biryanis',
        calories: '590 kcal',
        variants: [
          { id: 'reg', label: 'Regular (Serves 1)', priceDelta: 0 },
          { id: 'handi', label: 'Family Clay Handi (Serves 2)', priceDelta: 210 },
        ],
      },
      {
        id: 'sh-3',
        name: 'Murgh Malai Seekh Kebab',
        description: 'Tender minced chicken skewers infused with cream cheese, white pepper, and fresh coriander.',
        price: 269,
        isVeg: false,
        category: 'Starters & Kebabs',
        calories: '410 kcal',
      },
      {
        id: 'sh-4',
        name: 'Burani Mint Raita & Mirchi Salan',
        description: 'Roasted garlic yogurt paired with tangy peanut-sesame Hyderabadi curry.',
        price: 89,
        isVeg: true,
        category: 'Sides',
        calories: '160 kcal',
      },
      {
        id: 'sh-5',
        name: 'Shahi Double Ka Meetha',
        description: 'Warm saffron-cardamom bread pudding topped with thick rabri and toasted pistachios.',
        price: 149,
        isVeg: true,
        category: 'Desserts',
        calories: '340 kcal',
      },
    ],
  },
  {
    id: 'rest-forno-napoli',
    name: 'Forno & Crust Pizzeria',
    cuisine: 'Pizza',
    cuisinesLabel: 'Neapolitan Pizza, Sourdough, Pasta',
    rating: 4.7,
    ratingCount: '1.9k',
    deliveryMins: 24,
    deliveryTimeLabel: '22–26 mins',
    distanceKm: 2.1,
    costForTwo: 650,
    offerText: 'Free delivery above ₹199',
    isPureVeg: false,
    neighborhood: 'Indiranagar, Bengaluru',
    image: '/src/assets/images/rest_woodfire_pizza_1795191595290.jpg',
    tagline: '48-hour fermented sourdough crusts baked in a 450°C oak-fired stone oven.',
    menu: [
      {
        id: 'fn-1',
        name: 'Classic Margherita DOP',
        description: 'Crushed San Marzano tomatoes, fresh buffalo mozzarella, sweet basil, and cold-pressed olive oil.',
        price: 369,
        isVeg: true,
        isBestseller: true,
        category: 'Wood-Fired Pizzas',
        calories: '620 kcal',
        variants: [
          { id: '10in', label: '10" Personal', priceDelta: 0 },
          { id: '12in', label: '12" Sharing', priceDelta: 150 },
        ],
      },
      {
        id: 'fn-2',
        name: 'Smoked Pepperoni & Hot Honey',
        description: 'Crisp cured pepperoni cups, fior di latte mozzarella, chili flakes, and wildflower hot honey drizzle.',
        price: 449,
        isVeg: false,
        isBestseller: true,
        category: 'Wood-Fired Pizzas',
        calories: '760 kcal',
        variants: [
          { id: '10in', label: '10" Personal', priceDelta: 0 },
          { id: '12in', label: '12" Sharing', priceDelta: 170 },
        ],
      },
      {
        id: 'fn-3',
        name: 'Truffle Mushroom & Roasted Garlic',
        description: 'Wild cremini mushrooms, whipped ricotta, caramelized shallots, and white truffle oil.',
        price: 419,
        isVeg: true,
        category: 'Wood-Fired Pizzas',
        calories: '650 kcal',
      },
      {
        id: 'fn-4',
        name: 'Pull-Apart Garlic Herb Knots',
        description: 'Warm sourdough knots brushed with roasted garlic butter, parsley, and aged parmesan.',
        price: 169,
        isVeg: true,
        category: 'Sides',
        calories: '320 kcal',
      },
      {
        id: 'fn-5',
        name: 'Classic Espresso Tiramisu',
        description: 'Mascarpone cream layered over espresso-soaked ladyfingers dusted with dark cocoa.',
        price: 219,
        isVeg: true,
        category: 'Desserts',
        calories: '380 kcal',
      },
    ],
  },
  {
    id: 'rest-brass-griddle',
    name: 'Brass Griddle Smash Burgers',
    cuisine: 'Burgers',
    cuisinesLabel: 'Smash Burgers, Crispy Fries, Shakes',
    rating: 4.6,
    ratingCount: '3.1k',
    deliveryMins: 18,
    deliveryTimeLabel: '16–20 mins',
    distanceKm: 1.2,
    costForTwo: 480,
    offerText: 'Express 18 min kitchen',
    isPureVeg: false,
    neighborhood: 'Koramangala 4th Block, Bengaluru',
    image: '/src/assets/images/rest_smash_burger_1795191595320.jpg',
    tagline: 'Lacy-edged smashed patties on toasted butter brioche with house-pickled crunch.',
    menu: [
      {
        id: 'bg-1',
        name: 'Double Classic Cheddar Smash',
        description: 'Two seared patties, double aged cheddar, house dill pickles, crisp iceberg, and smoky griddle sauce.',
        price: 289,
        isVeg: false,
        isBestseller: true,
        category: 'Signature Burgers',
        calories: '710 kcal',
        variants: [
          { id: 'solo', label: 'Burger Only', priceDelta: 0 },
          { id: 'meal', label: 'Combo with Fries & Iced Tea', priceDelta: 110 },
        ],
      },
      {
        id: 'bg-2',
        name: 'Crispy Paneer & Chipotle Crunch',
        description: 'Herb-crusted cottage cheese patty, pickled jalapeños, charred onions, and chipotle mayo on brioche.',
        price: 249,
        isVeg: true,
        isBestseller: true,
        category: 'Signature Burgers',
        calories: '610 kcal',
        variants: [
          { id: 'solo', label: 'Burger Only', priceDelta: 0 },
          { id: 'meal', label: 'Combo with Fries & Iced Tea', priceDelta: 110 },
        ],
      },
      {
        id: 'bg-3',
        name: 'Nashville Hot Crispy Chicken',
        description: 'Buttermilk-brined chicken thigh glazed in spiced cayenne oil with cool slaw and pickles.',
        price: 299,
        isVeg: false,
        category: 'Signature Burgers',
        calories: '690 kcal',
      },
      {
        id: 'bg-4',
        name: 'Rosemary Sea-Salt Crinkle Fries',
        description: 'Golden double-fried crinkle potatoes tossed with crispy rosemary and sea salt.',
        price: 139,
        isVeg: true,
        category: 'Sides',
        calories: '360 kcal',
      },
      {
        id: 'bg-5',
        name: 'Salted Caramel Malt Shake',
        description: 'Thick hand-spun vanilla bean gelato blended with house salted caramel.',
        price: 179,
        isVeg: true,
        category: 'Beverages',
        calories: '420 kcal',
      },
    ],
  },
  {
    id: 'rest-kuro-sushi',
    name: 'Kuro Craft Sushi & Ramen',
    cuisine: 'Sushi & Asian',
    cuisinesLabel: 'Japanese Sushi, Dim Sum, Ramen',
    rating: 4.9,
    ratingCount: '1.3k',
    deliveryMins: 28,
    deliveryTimeLabel: '25–30 mins',
    distanceKm: 2.9,
    costForTwo: 950,
    offerText: 'Top Rated 4.9 ★ Kitchen',
    isPureVeg: false,
    neighborhood: 'Bandra West, Mumbai',
    image: '/src/assets/images/rest_sushi_asian_1795191595430.jpg',
    tagline: 'Hand-pressed nigiri, crisp uramaki rolls, and 14-hour simmered ramen broths.',
    menu: [
      {
        id: 'ks-1',
        name: 'Fresh Atlantic Salmon Nigiri & Maki Box',
        description: '4 pieces salmon nigiri and 6 pieces avocado hosomaki served with pickled ginger and real wasabi.',
        price: 549,
        isVeg: false,
        isBestseller: true,
        category: 'Sushi Boxes',
        calories: '480 kcal',
      },
      {
        id: 'ks-2',
        name: 'Crispy Asparagus & Truffle Avocado Roll',
        description: '8-piece uramaki rolled with tempura asparagus, creamy avocado, toasted sesame, and yuzu ponzu.',
        price: 429,
        isVeg: true,
        isBestseller: true,
        category: 'Sushi Boxes',
        calories: '410 kcal',
      },
      {
        id: 'ks-3',
        name: 'Spicy Miso Ramen Bowl',
        description: 'Springy alkaline noodles in rich roasted miso broth with charred corn, bamboo shoots, and scallions.',
        price: 469,
        isVeg: true,
        category: 'Hot Ramen',
        calories: '580 kcal',
        variants: [
          { id: 'veg', label: 'Crispy Tofu & Shiitake', priceDelta: 0 },
          { id: 'chashu', label: 'Braised Chicken Chashu', priceDelta: 70 },
        ],
      },
      {
        id: 'ks-4',
        name: 'Steamed Edamame with Chili Garlic',
        description: 'Warm tender edamame pods tossed in flaky sea salt and roasted chili oil.',
        price: 219,
        isVeg: true,
        category: 'Small Plates',
        calories: '210 kcal',
      },
    ],
  },
  {
    id: 'rest-verde-harvest',
    name: 'Verde Harvest Bowls',
    cuisine: 'Healthy Bowls',
    cuisinesLabel: 'Grain Bowls, Salads, Cold-Pressed',
    rating: 4.8,
    ratingCount: '1.7k',
    deliveryMins: 19,
    deliveryTimeLabel: '17–21 mins',
    distanceKm: 1.5,
    costForTwo: 520,
    offerText: '100% Pure Veg · Fresh Prep',
    isPureVeg: true,
    neighborhood: 'Indiranagar, Bengaluru',
    image: '/src/assets/images/rest_harvest_bowls_1795191595719.jpg',
    tagline: 'Balanced macro-friendly grain bowls made fresh to order with local farm produce.',
    menu: [
      {
        id: 'vh-1',
        name: 'Mediterranean Avocado & Grilled Tofu Bowl',
        description: 'Warm herbed farro & quinoa, Hass avocado, roasted sweet potato, pickled red onion, and lemon tahini.',
        price: 319,
        isVeg: true,
        isBestseller: true,
        category: 'Signature Bowls',
        calories: '510 kcal',
        variants: [
          { id: 'regular', label: 'Regular Bowl', priceDelta: 0 },
          { id: 'protein', label: 'High-Protein (+Extra Grilled Paneer)', priceDelta: 80 },
        ],
      },
      {
        id: 'vh-2',
        name: 'Chipotle Burrito Fiesta Bowl',
        description: 'Cilantro lime brown rice, spiced black beans, charred sweet corn, guacamole, and crisp tortilla strips.',
        price: 299,
        isVeg: true,
        isBestseller: true,
        category: 'Signature Bowls',
        calories: '540 kcal',
      },
      {
        id: 'vh-3',
        name: 'Pesto Burrata & Cherry Tomato Salad',
        description: 'Baby arugula, heirloom cherry tomatoes, creamy burrata, basil pesto, and toasted pine nuts.',
        price: 349,
        isVeg: true,
        category: 'Fresh Salads',
        calories: '430 kcal',
      },
      {
        id: 'vh-4',
        name: 'Cold-Pressed Valencia Orange & Ginger',
        description: '300ml raw cold-pressed citrus juice with fresh ginger root and zero added sugar.',
        price: 139,
        isVeg: true,
        category: 'Drinks',
        calories: '120 kcal',
      },
    ],
  },
  {
    id: 'rest-velvet-patisserie',
    name: 'Velvet Crumb Patisserie',
    cuisine: 'Desserts',
    cuisinesLabel: 'Artisan Cakes, Gelato, Hot Chocolate',
    rating: 4.9,
    ratingCount: '2.1k',
    deliveryMins: 16,
    deliveryTimeLabel: '14–18 mins',
    distanceKm: 1.1,
    costForTwo: 420,
    offerText: '16 min sweet delivery',
    isPureVeg: true,
    neighborhood: 'Koramangala 4th Block, Bengaluru',
    image: '/src/assets/images/rest_artisan_desserts_1795191595450.jpg',
    tagline: 'Single-origin Belgian chocolate desserts, warm bakes, and small-batch vanilla gelato.',
    menu: [
      {
        id: 'vc-1',
        name: 'Warm Belgian Molten Lava Cake & Gelato',
        description: '70% dark chocolate fondant cake with a gooey center, served with Madagascar vanilla bean gelato.',
        price: 249,
        isVeg: true,
        isBestseller: true,
        category: 'Warm Bakes',
        calories: '490 kcal',
      },
      {
        id: 'vc-2',
        name: 'Classic Burnt Basque Cheesecake',
        description: 'Caramelized crust with a velvety whipped vanilla cream-cheese center and berry compote.',
        price: 279,
        isVeg: true,
        isBestseller: true,
        category: 'Cakes',
        calories: '440 kcal',
      },
      {
        id: 'vc-3',
        name: 'Hazelnut Praline Mille-Feuille',
        description: 'Crisp caramelized puff pastry layered with roasted Piedmont hazelnut diplomat cream.',
        price: 239,
        isVeg: true,
        category: 'Pastries',
        calories: '390 kcal',
      },
      {
        id: 'vc-4',
        name: 'Iced Belgian Mocha Cold Brew',
        description: '18-hour single-origin cold brew shaken with dark chocolate ganache and oat milk.',
        price: 189,
        isVeg: true,
        category: 'Beverages',
        calories: '190 kcal',
      },
    ],
  },
];
