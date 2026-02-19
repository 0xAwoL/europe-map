import type { ReactNode } from "react";

// ── City Marker ─────────────────────────────────────────────────────────
export type MapCity = {
    name: string;
    lat: number;
    lng: number;
};

// ── Connection ──────────────────────────────────────────────────────────
export type MapConnection = [string, string];

// ── Event ───────────────────────────────────────────────────────────────
export type MapEvent = {
    /** Unique identifier — a new id triggers a new animation */
    id: string;
    /** Target city name (must match a city in the `cities` prop) */
    city: string;
    /** Animation type */
    type: "pulse" | "ripple" | "packet";
    /** Optional override color (default: emerald) */
    color?: string;
    /** Animation duration in seconds (default: 1.5) */
    duration?: number;
    /** For "packet" type: destination city name */
    target?: string;
};

// ── EuropeMap Props ─────────────────────────────────────────────────────
export type EuropeMapProps = {
    cities?: MapCity[];
    connections?: MapConnection[];
    /** Content rendered on the left overlay */
    children?: ReactNode;
    theme?: "light" | "dark";
    /** Map center [lng, lat] */
    center?: [number, number];
    zoom?: number;
    /** SSE / polling endpoint for the event queue */
    apiUrl?: string;
    /** Ms between event dequeues (default: 2000) */
    queueInterval?: number;
    className?: string;
};
