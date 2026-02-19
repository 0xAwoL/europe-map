/**
 * Simulate heavy map traffic by POSTing packet/pulse/ripple events
 * Run: npx tsx scripts/simulate-traffic.ts
 */

const API = "http://localhost:3000/api/events";


const CONNECTIONS: [string, string][] = [
    ["Warsaw", "Berlin"],
    ["Berlin", "Amsterdam"],
    ["Amsterdam", "Brussels"],
    ["Brussels", "Paris"],
    ["Paris", "Madrid"],
    ["Madrid", "Lisbon"],
    ["Rome", "Vienna"],
    ["Vienna", "Prague"],
    ["Prague", "Warsaw"],
    ["Stockholm", "Helsinki"],
    ["Stockholm", "Copenhagen"],
    ["Copenhagen", "Berlin"],
    ["Budapest", "Vienna"],
    ["Athens", "Rome"],
    ["Bucharest", "Budapest"],
    ["Brussels", "Dublin"],
    ["Zagreb", "Ljubljana"],
    ["Ljubljana", "Vienna"],
    ["Bratislava", "Vienna"],
    ["Budapest", "Warsaw"],
];

let counter = 0;

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function makePacketEvent() {
    const conn = pick(CONNECTIONS);
    const reversed = Math.random() > 0.5;
    const from = reversed ? conn[1] : conn[0];
    const to = reversed ? conn[0] : conn[1];
    return {
        id: `sim-pkt-${counter++}`,
        city: from,
        target: to,
        type: "packet" as const,
        color: "#10b981", // emerald-500
        duration: 1 + Math.random() * 2, // 1–3s
    };
}



function makeBatch(size: number) {
    const events = [];
    for (let i = 0; i < size; i++) {
        // ONLY generate packets (moving dots), no start/end pulses
        events.push(makePacketEvent());
    }
    return events;
}

async function sendBatch(events: ReturnType<typeof makeBatch>) {
    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
    });
    const json = await res.json();
    return json;
}

// ── Main loop ────────────────────────────────────────────────────────────
async function main() {
    const BATCH_SIZE = 30;      // events per burst
    const INTERVAL_MS = 200;    // burst every 200ms
    const TOTAL_BATCHES = 400;  // more batches

    console.log(`🚀 Simulating HIGH DENSITY traffic: ${TOTAL_BATCHES} batches × ${BATCH_SIZE} events every ${INTERVAL_MS}ms`);
    console.log(`   Total: ~${TOTAL_BATCHES * BATCH_SIZE} events over ~${(TOTAL_BATCHES * INTERVAL_MS / 1000).toFixed(0)}s\n`);

    for (let i = 0; i < TOTAL_BATCHES; i++) {
        const batch = makeBatch(BATCH_SIZE);
        try {
            const result = await sendBatch(batch);
            const types = batch.map((e) => e.type[0]).join("");
            console.log(`  [${String(i + 1).padStart(3)}/${TOTAL_BATCHES}] sent ${batch.length} events — queued: ${result.total}`);
        } catch (err) {
            console.error(`  ❌ batch ${i + 1} failed:`, err);
        }
        await new Promise((r) => setTimeout(r, INTERVAL_MS));
    }

    console.log(`\n✅ Done! Sent ${counter} events total.`);
}

main();
