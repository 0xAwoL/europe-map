import { NextResponse } from "next/server";
import type { MapEvent } from "@/components/europe-map/types";

// ── In-memory queue ─────────────────────────────────────────────────────
const queue: MapEvent[] = [];

// Subscribers waiting for SSE push
type Subscriber = (event: MapEvent) => void;
const subscribers = new Set<Subscriber>();

// ── POST: push event(s) to the queue ────────────────────────────────────
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const events: MapEvent[] = Array.isArray(body) ? body : [body];

        // Validate minimal shape
        for (const e of events) {
            if (!e.id || !e.city || !e.type) {
                return NextResponse.json(
                    { error: "Each event needs id, city, and type" },
                    { status: 400 },
                );
            }
        }

        queue.push(...events);

        // Notify SSE subscribers
        for (const event of events) {
            for (const sub of subscribers) {
                sub(event);
            }
        }

        return NextResponse.json({
            queued: events.length,
            total: queue.length,
        });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}

// ── GET: SSE stream ─────────────────────────────────────────────────────
export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Send any already-queued events
            for (const event of queue) {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
                );
            }

            // Subscribe to future events
            const handler: Subscriber = (event) => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
                    );
                } catch {
                    subscribers.delete(handler);
                }
            };

            subscribers.add(handler);

            // Keep-alive ping every 30s
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": keep-alive\n\n"));
                } catch {
                    clearInterval(keepAlive);
                    subscribers.delete(handler);
                }
            }, 30_000);

            // Cleanup when client disconnects (signal abort)
            // The ReadableStream cancel is triggered when the client disconnects
        },
        cancel() {
            // Stream was cancelled by client
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
