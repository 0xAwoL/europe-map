"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMap } from "@/components/ui/map";
import type { MapEvent, MapCity } from "./types";
import { getCityCoords } from "./utils";

/** Processes MapEvent[] and fires GSAP one-shot animations */
export function EventAnimations({
    events,
    cities,
}: {
    events: MapEvent[];
    cities: MapCity[];
}) {
    const { map, isLoaded } = useMap();
    const processedRef = useRef<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoaded || !map || !containerRef.current) return;

        events.forEach((event) => {
            if (processedRef.current.has(event.id)) return;
            processedRef.current.add(event.id);

            const cityCoords = getCityCoords(cities, event.city);
            if (cityCoords[0] === 0 && cityCoords[1] === 0) return;

            const color = event.color ?? "#10b981";
            const dur = event.duration ?? 1.5;

            if (event.type === "pulse") {
                const point = map.project(cityCoords);
                const el = document.createElement("div");
                el.style.cssText = `
          position:absolute; left:${point.x}px; top:${point.y}px;
          width:20px; height:20px; border-radius:50%; background:${color};
          transform:translate(-50%,-50%) scale(0); opacity:0.8;
          pointer-events:none; z-index:20;
        `;
                containerRef.current!.appendChild(el);
                gsap.fromTo(
                    el,
                    { scale: 0, opacity: 0.8 },
                    { scale: 8, opacity: 0, duration: dur, ease: "power2.out", onComplete: () => el.remove() },
                );
            } else if (event.type === "ripple") {
                const point = map.project(cityCoords);
                const tl = gsap.timeline();
                for (let i = 0; i < 3; i++) {
                    const ring = document.createElement("div");
                    ring.style.cssText = `
            position:absolute; left:${point.x}px; top:${point.y}px;
            width:10px; height:10px; border-radius:50%; border:2px solid ${color};
            transform:translate(-50%,-50%) scale(0); opacity:0.6;
            pointer-events:none; z-index:20;
          `;
                    containerRef.current!.appendChild(ring);
                    tl.fromTo(
                        ring,
                        { scale: 0, opacity: 0.6 },
                        { scale: 6, opacity: 0, duration: dur, ease: "power1.out", onComplete: () => ring.remove() },
                        i * 0.3,
                    );
                }
            } else if (event.type === "packet" && event.target) {
                const targetCoords = getCityCoords(cities, event.target);
                if (targetCoords[0] === 0 && targetCoords[1] === 0) return;

                const dot = document.createElement("div");
                dot.style.cssText = `
          position:absolute; width:6px; height:6px; border-radius:50%;
          background:${color}; box-shadow:0 0 12px 3px ${color}88,0 0 24px 6px ${color}44;
          pointer-events:none; z-index:20; opacity:0;
        `;
                containerRef.current!.appendChild(dot);

                const proxy = { t: 0 };
                gsap.to(proxy, {
                    t: 1,
                    duration: dur,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        const lng = cityCoords[0] + (targetCoords[0] - cityCoords[0]) * proxy.t;
                        const lat = cityCoords[1] + (targetCoords[1] - cityCoords[1]) * proxy.t;
                        const p = map.project([lng, lat]);
                        dot.style.transform = `translate(${p.x - 3}px, ${p.y - 3}px)`;
                        dot.style.opacity = proxy.t < 0.05 || proxy.t > 0.95 ? "0" : "1";
                    },
                    onComplete: () => dot.remove(),
                });
            }
        });
    }, [events, isLoaded, map, cities]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
        />
    );
}
