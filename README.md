# Europe Map

Interactive Europe map with animated city markers, data packet flows, and a **real-time event queue** powered by GSAP + MapLibre (via [mapcn](https://mapcn.dev)).

## Quick Start

```bash
pnpm install
pnpm dev        # → http://localhost:3000
```

## How the Event Queue Works

The system has three layers:

```
┌──────────────┐    POST     ┌──────────────┐    SSE      ┌──────────────────┐
│  Any Client  │ ──────────► │  /api/events │ ─────────► │  useEventQueue() │
│  (curl, app) │             │  (in-memory) │             │  (React hook)    │
└──────────────┘             └──────────────┘             └────────┬─────────┘
                                                                   │ dequeues 1 event
                                                                   │ every N ms
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │ EventAnimations  │
                                                          │ (GSAP triggers)  │
                                                          └──────────────────┘
```

### 1. Push events → API

Send a `POST` to `/api/events` with a JSON body. The server stores them in-memory and pushes them to all connected SSE clients.

```bash
# Single event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"id":"e1","city":"Warsaw","type":"pulse"}'

# Batch
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '[
    {"id":"e2","city":"Berlin","type":"ripple"},
    {"id":"e3","city":"Paris","type":"packet","target":"Madrid","duration":2}
  ]'
```

### 2. `useEventQueue` hook (client-side)

The hook does three things:

1. **Subscribes** to the SSE stream at `apiUrl` (e.g. `/api/events`)
2. **Buffers** incoming events in a FIFO queue (no renders on push)
3. **Dequeues** one event every `interval` ms (default: 2000) into the `events` array

```tsx
const { events, pushEvent, queueSize } = useEventQueue({
  apiUrl: "/api/events",  // SSE endpoint
  interval: 2000,         // dequeue rate in ms
});
```

You can also push events directly from the client without the API:

```tsx
pushEvent({ id: "local-1", city: "Rome", type: "pulse" });
```

### 3. `EventAnimations` renders them

Each dequeued event fires a one-shot GSAP animation on the map:

| `type`   | What it does |
|----------|-------------|
| `pulse`  | Expanding circle at the city |
| `ripple` | Three concentric rings (staggered) |
| `packet` | Glowing dot travels from `city` → `target` |

Events are deduplicated by `id` — the same `id` won't animate twice.

## Event Shape

```ts
type MapEvent = {
  id: string;           // unique — changing this triggers animation
  city: string;         // must match a city name (e.g. "Warsaw")
  type: "pulse" | "ripple" | "packet";
  color?: string;       // CSS color (default: "#10b981")
  duration?: number;    // seconds (default: 1.5)
  target?: string;      // required for "packet" type
};
```

## Component Usage

```tsx
import { EuropeMap } from "@/components/europe-map";

<EuropeMap
  apiUrl="/api/events"      // connects SSE event queue
  queueInterval={1500}      // dequeue speed (ms)
  theme="dark"              // "light" | "dark"
  center={[15, 50]}         // [lng, lat]
  zoom={3.5}
>
  {/* anything here renders as left overlay */}
  <h2>Your content here</h2>
</EuropeMap>
```

## Customization

### Map theme & style

Pass custom tile styles via the `Map` component's `styles` prop ([mapcn docs → API Reference → styles](https://www.mapcn.dev/docs/api-reference)):

```tsx
<Map styles={{ dark: "https://your-tile-server/style.json" }} />
```

### GSAP timeline sequencing

All animations use GSAP — you can sequence them by controlling the `queueInterval` or by posting events with specific `duration` values so they overlap or chain.

## File Structure

```
components/europe-map/
├── types.ts              # MapCity, MapConnection, MapEvent, EuropeMapProps
├── data.ts               # default 20 cities + 20 connections
├── styles.ts             # CSS keyframes & shadows
├── utils.ts              # getCityCoords()
├── pulse-marker.tsx      # pulsing dot + label
├── data-packet.tsx       # GSAP animated packet along route
├── country-contours.tsx  # GeoJSON borders + GSAP dash animation
├── event-animations.tsx  # one-shot GSAP animations from events
├── use-event-queue.ts    # FIFO queue hook + SSE subscriber
├── europe-map.tsx        # main orchestrator component
└── index.ts              # barrel export

app/api/events/
└── route.ts              # POST to push, GET for SSE stream
```