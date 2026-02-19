"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MapEvent } from "./types";

type EventQueueOptions = {
    /** SSE endpoint to subscribe to (e.g. "/api/events") */
    apiUrl?: string;
    /** Ms between dequeues (default: 2000) */
    interval?: number;
};

/**
 * Manages an internal FIFO queue of MapEvents.
 *
 * - `pushEvent` / `pushEvents` — add to the queue from anywhere
 * - Optionally subscribes to an SSE endpoint that streams events
 * - Dequeues one event at a time at `interval` ms and feeds it downstream
 * - Auto-prunes finished events so the array stays small
 */
export function useEventQueue(opts: EventQueueOptions = {}) {
    const { apiUrl, interval = 2000 } = opts;

    // Events currently "active" — handed to EventAnimations for rendering
    const [activeEvents, setActiveEvents] = useState<MapEvent[]>([]);

    // Internal FIFO queue (ref avoids renders on every push)
    const queueRef = useRef<MapEvent[]>([]);
    const [queueSize, setQueueSize] = useState(0);

    // ── Push helpers ──────────────────────────────────────────────────────
    const pushEvent = useCallback((event: MapEvent) => {
        queueRef.current.push(event);
        setQueueSize(queueRef.current.length);
    }, []);

    const pushEvents = useCallback((events: MapEvent[]) => {
        queueRef.current.push(...events);
        setQueueSize(queueRef.current.length);
    }, []);

    // ── Dequeue timer ─────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => {
            if (queueRef.current.length === 0) return;

            const next = queueRef.current.shift()!;
            setQueueSize(queueRef.current.length);
            setActiveEvents((prev) => [...prev, next]);

            // Auto-prune this event after its animation finishes (duration + buffer)
            const lifetimeMs = ((next.duration ?? 1.5) + 1) * 1000;
            setTimeout(() => {
                setActiveEvents((prev) => prev.filter((e) => e.id !== next.id));
            }, lifetimeMs);
        }, interval);

        return () => clearInterval(timer);
    }, [interval]);

    // ── SSE subscription ──────────────────────────────────────────────────
    useEffect(() => {
        if (!apiUrl) return;

        const es = new EventSource(apiUrl);

        es.onmessage = (msg) => {
            try {
                const data = JSON.parse(msg.data);
                const events: MapEvent[] = Array.isArray(data) ? data : [data];
                queueRef.current.push(...events);
                setQueueSize(queueRef.current.length);
            } catch {
                /* ignore malformed messages */
            }
        };

        es.onerror = () => {
            // EventSource auto-reconnects; nothing to do
        };

        return () => es.close();
    }, [apiUrl]);

    return { events: activeEvents, pushEvent, pushEvents, queueSize };
}
