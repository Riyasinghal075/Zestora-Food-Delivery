import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import { RESTAURANTS } from './src/data/restaurants.ts';
import type { OrderRecord, OrderStatus } from './src/data/restaurants.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const RIDER_NAMES = ['Arjun K.', 'Rohan M.', 'Priya S.', 'Vikram N.', 'Neha T.'];

const STATUS_SEQUENCE: OrderStatus[] = [
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

const ETA_MAP: Record<OrderStatus, number> = {
  confirmed: 22,
  preparing: 15,
  out_for_delivery: 7,
  delivered: 0,
};

// Server-side progression interval per stage (ms) for real-time kitchen/delivery updates
const STAGE_DURATION_MS: Partial<Record<OrderStatus, number>> = {
  confirmed: 6000,
  preparing: 7000,
  out_for_delivery: 8000,
};

function loadOrders(): OrderRecord[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as OrderRecord[];
      }
    }
  } catch {
    // Fallback to empty array if file unreadable
  }
  return [];
}

function saveOrders(orders: OrderRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders.slice(0, 50), null, 2), 'utf-8');
  } catch {
    // Non-fatal in read-only environments
  }
}

let ordersStore: OrderRecord[] = loadOrders();
const progressionTimers = new Map<string, ReturnType<typeof setTimeout>>();

type WsServerEvent =
  | { type: 'orders:sync'; orders: OrderRecord[] }
  | { type: 'order:created'; order: OrderRecord }
  | { type: 'order:updated'; order: OrderRecord };

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const broadcastEvent = (event: WsServerEvent) => {
    const payload = JSON.stringify(event);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  const clearOrderTimer = (orderId: string) => {
    const existing = progressionTimers.get(orderId);
    if (existing) {
      clearTimeout(existing);
      progressionTimers.delete(orderId);
    }
  };

  const transitionOrderStatus = (
    orderId: string,
    nextStatus: OrderStatus
  ): OrderRecord | null => {
    const idx = ordersStore.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const current = ordersStore[idx];
    const updated: OrderRecord = {
      ...current,
      status: nextStatus,
      etaMinutes: ETA_MAP[nextStatus],
      statusUpdatedAt: now,
      statusHistory: {
        ...(current.statusHistory || {}),
        [nextStatus]: now,
      },
    };

    ordersStore[idx] = updated;
    saveOrders(ordersStore);
    broadcastEvent({ type: 'order:updated', order: updated });
    scheduleNextStage(updated);
    return updated;
  };

  const scheduleNextStage = (order: OrderRecord) => {
    clearOrderTimer(order.id);
    const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STATUS_SEQUENCE.length - 1) {
      return;
    }

    const delay = STAGE_DURATION_MS[order.status];
    if (!delay) return;

    const nextStatus = STATUS_SEQUENCE[currentIndex + 1];
    const timer = setTimeout(() => {
      progressionTimers.delete(order.id);
      transitionOrderStatus(order.id, nextStatus);
    }, delay);

    progressionTimers.set(order.id, timer);
  };

  // Resume server-side progression for any active orders loaded on startup
  for (const order of ordersStore) {
    if (order.status !== 'delivered') {
      scheduleNextStage(order);
    }
  }

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'orders:sync', orders: ordersStore }));
  });

  // Healthcheck endpoint for Docker, Kubernetes & CI/CD probes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'zestora-web',
      connectedClients: wss.clients.size,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Restaurant catalog API with optional filtering
  app.get('/api/restaurants', (req: Request, res: Response) => {
    const cuisine = typeof req.query.cuisine === 'string' ? req.query.cuisine : 'All';
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const vegOnly = req.query.veg === 'true';

    const filtered = RESTAURANTS.filter((restaurant) => {
      if (cuisine !== 'All' && restaurant.cuisine !== cuisine) {
        return false;
      }
      if (vegOnly && !restaurant.isPureVeg && !restaurant.menu.some((m) => m.isVeg)) {
        return false;
      }
      if (q) {
        const matchesRest =
          restaurant.name.toLowerCase().includes(q) ||
          restaurant.cuisinesLabel.toLowerCase().includes(q);
        const matchesMenu = restaurant.menu.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
        );
        return matchesRest || matchesMenu;
      }
      return true;
    });

    res.json({ restaurants: filtered, total: filtered.length });
  });

  // Fetch recent orders
  app.get('/api/orders', (_req: Request, res: Response) => {
    res.json({ orders: ordersStore });
  });

  // Place a new food order
  app.post('/api/orders', (req: Request, res: Response) => {
    const body = req.body as Partial<OrderRecord>;

    if (
      !body.restaurantId ||
      !body.restaurantName ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      !body.customerName ||
      !body.phone ||
      !body.address
    ) {
      res.status(400).json({ error: 'Missing required order fields.' });
      return;
    }

    const subtotal = Number(body.subtotal) || 0;
    const deliveryFee = Number(body.deliveryFee) || 0;
    const platformFee = Number(body.platformFee) || 0;
    const discount = Number(body.discount) || 0;
    const total = Math.max(0, subtotal + deliveryFee + platformFee - discount);

    const restaurant = RESTAURANTS.find((r) => r.id === body.restaurantId);
    const etaMinutes = restaurant ? restaurant.deliveryMins : ETA_MAP.confirmed;
    const riderName = RIDER_NAMES[Math.floor(Math.random() * RIDER_NAMES.length)];
    const now = new Date().toISOString();

    const newOrder: OrderRecord = {
      id: `ZST-${Math.floor(1000 + Math.random() * 9000)}`,
      restaurantId: body.restaurantId,
      restaurantName: body.restaurantName,
      items: body.items,
      subtotal,
      deliveryFee,
      platformFee,
      discount,
      total,
      promoCode: body.promoCode,
      customerName: body.customerName.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      instructions: body.instructions?.trim() || '',
      paymentMethod: body.paymentMethod || 'UPI Instant',
      status: 'confirmed',
      etaMinutes,
      riderName,
      createdAt: now,
      statusUpdatedAt: now,
      statusHistory: {
        confirmed: now,
      },
    };

    ordersStore = [newOrder, ...ordersStore];
    saveOrders(ordersStore);

    broadcastEvent({ type: 'order:created', order: newOrder });
    scheduleNextStage(newOrder);

    res.status(201).json({ order: newOrder });
  });

  // Update order status (e.g. from kitchen/operator or manual step advance)
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body as { status?: OrderStatus };

    if (!status || !STATUS_SEQUENCE.includes(status)) {
      res.status(400).json({ error: 'Invalid order status.' });
      return;
    }

    clearOrderTimer(id);
    const updated = transitionOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    res.json({ order: updated });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Zestora server & WebSocket running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
