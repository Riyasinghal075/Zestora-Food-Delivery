# Zestora — Online Food Ordering System (DevOps Ready)

Zestora is a full-stack online food ordering web application inspired by Zomato, Swiggy, and Swish. It features an animated storefront, restaurant & dish discovery, interactive menus with portion customization, slide-over cart & checkout, real-time WebSocket order tracking, and a complete DevOps setup (Docker, Docker Compose, and GitHub Actions CI/CD).

## Features

- **Animated Discovery & Search**: Neighborhood selector, instant dish/kitchen search, cuisine tabs, dietary (`Pure Veg`) and delivery-time filters, and sorting.
- **Interactive Restaurant Menus**: In-menu dish search, veg-only filter, portion/variant selection, `+ Add` / `- qty +` steppers, and cart conflict protection.
- **Cart & Validated Checkout**: Promo codes (`WELCOME20`, `FREEDEL`), itemized bill breakdown, delivery form validation, and multiple payment options.
- **Real-Time Order Tracking (WebSockets)**: Live status updates (`Order Placed` → `Preparing` → `Out for Delivery` → `Delivered`) pushed automatically from the server to all connected browsers without manual refresh.
- **DevOps & CI/CD Pipeline**:
  - Multi-stage `Dockerfile` for lean production containers
  - `docker-compose.yml` with persistent order storage and `/api/health` health checks
  - `.github/workflows/ci-cd.yml` for automated TypeScript checks, production builds, API smoke tests, and Docker image verification

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion animations, Lucide icons
- **Backend**: Node.js 22, Express REST API (`/api/restaurants`, `/api/orders`, `/api/health`) + WebSocket server (`ws` on `/ws`)
- **DevOps**: Docker, Docker Compose, GitHub Actions

---

## How to Upload This Project to GitHub (`Riyasinghal075`)

1. Sign in to GitHub as **Riyasinghal075** and create a new empty repository named `zestora-food-ordering` (do not add a README or `.gitignore`, since they are already included).
2. Open a terminal inside the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit: Zestora online food ordering system with real-time tracking and DevOps"
git branch -M main
git remote add origin https://github.com/Riyasinghal075/Zestora-Food-Ordering.git
git push -u origin main
```

Once pushed, GitHub Actions automatically runs the workflow in `.github/workflows/ci-cd.yml`.

---

## How to Set Up on Your Local System

### Option A: Run with Node.js (Recommended for Development)

**Prerequisites:**
- [Node.js v22+](https://nodejs.org/)
- [Git](https://git-scm.com/)

```bash
# 1. Clone the repository
git clone https://github.com/Riyasinghal075/Zestora-Food-Ordering.git
cd Zestora-Food-Ordering

# 2. Install dependencies
npm install

# 3. (Optional) Copy environment template if customizing variables
cp .env.example .env

# 4. Start the development server (HTTP + WebSockets on port 3000)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

To run the optimized production build locally:

```bash
npm run build
NODE_ENV=production npm start
```

### Option B: Run with Docker & Docker Compose (Zero Node Setup Needed)

**Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/Riyasinghal075/Zestora-Food-Ordering.git
cd Zestora-Food-Ordering

# Build and start the container in the background
docker compose up --build -d

# Verify the server is healthy
curl http://localhost:3000/api/health
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser. To stop the container later, run `docker compose down`.

---

## How to Set Up & Access on Other Devices

### 1. Access From a Phone, Tablet, or Another Laptop on the Same Wi-Fi
Because the Zestora server listens on `0.0.0.0:3000`, any device on your same Wi-Fi/local network can open the app directly and see **real-time WebSocket order updates** synced across devices:

1. Start the app on your main computer (`npm run dev` or `docker compose up -d`).
2. Find your computer's local IP address:
   - **Windows**: Open Command Prompt and run `ipconfig` → look for **IPv4 Address** (e.g., `192.168.1.24`).
   - **macOS**: Run `ipconfig getifaddr en0` in Terminal.
   - **Linux**: Run `hostname -I` in Terminal.
3. On your phone or second laptop (connected to the same Wi-Fi), open a browser and go to:
   ```text
   http://<YOUR_LOCAL_IP>:3000
   ```
   *(Example: `http://192.168.1.24:3000`)*
4. If your OS firewall blocks incoming port `3000`, allow Node.js / port `3000` through Windows Defender Firewall or macOS Firewall.

### 2. Set Up on a Completely New Computer
On any other laptop/desktop (Windows, macOS, or Linux):
1. Install **Git** and either **Node.js 22+** or **Docker Desktop**.
2. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/Riyasinghal075/zestora-food-ordering.git
   cd zestora-food-ordering
   ```
3. Run `npm install && npm run dev` (or `docker compose up --build -d`).

---

## API & Health Endpoints

- `GET /api/health` — Service health & active WebSocket client count
- `GET /api/restaurants` — Restaurant & menu catalog (supports `?cuisine=`, `?q=`, `?veg=true`)
- `GET /api/orders` — List recent orders
- `POST /api/orders` — Place a new order and broadcast `order:created`
- `PATCH /api/orders/:id/status` — Update order stage and broadcast `order:updated`
- `WS /ws` — Real-time WebSocket channel (`orders:sync`, `order:created`, `order:updated`)
