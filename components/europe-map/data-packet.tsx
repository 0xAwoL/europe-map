"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useMap } from "@/components/ui/map";

/** GSAP-powered data packet flowing from `from` → `to` */
export function DataPacket({
    from,
    to,
    delay,
    duration,
}: {
    from: [number, number];
    to: [number, number];
    delay: number;
    duration: number;
}) {
    const packetRef = useRef<HTMLDivElement>(null);
    const { map, isLoaded } = useMap();
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    const updatePosition = useCallback(
        (progress: number) => {
            if (!map || !packetRef.current) return;

            const lng = from[0] + (to[0] - from[0]) * progress;
            const lat = from[1] + (to[1] - from[1]) * progress;
            const point = map.project([lng, lat]);

            packetRef.current.style.transform = `translate(${point.x}px, ${point.y}px)`;
            packetRef.current.style.opacity =
                progress < 0.05 || progress > 0.95 ? "0" : "1";
        },
        [map, from, to],
    );

    useEffect(() => {
        if (!isLoaded || !map) return;

        const proxy = { progress: 0 };

        tweenRef.current = gsap.to(proxy, {
            progress: 1,
            duration,
            delay: delay / 1000,
            ease: "power2.inOut",
            repeat: -1,
            onUpdate: () => updatePosition(proxy.progress),
        });

        const onMove = () => updatePosition(proxy.progress);
        map.on("move", onMove);

        return () => {
            tweenRef.current?.kill();
            map.off("move", onMove);
        };
    }, [isLoaded, map, delay, duration, updatePosition]);

    return (
        <div
            ref={packetRef}
            className="eu-data-packet absolute top-0 left-0 pointer-events-none will-change-transform w-1 h-1 rounded-full bg-emerald-400 transition-opacity duration-300"
        />
    );
}
