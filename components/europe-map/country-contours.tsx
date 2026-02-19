"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMap } from "@/components/ui/map";

const GEOJSON_URL =
    "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const EU_CODES = new Set([
    "POL", "DEU", "FRA", "ESP", "ITA", "BEL", "NLD", "AUT", "CZE", "SWE",
    "FIN", "PRT", "IRL", "GRC", "HUN", "ROU", "DNK", "HRV", "SVK", "SVN",
    "BGR", "EST", "LVA", "LTU", "LUX", "MLT", "CYP", "NOR", "CHE", "GBR",
    "SRB", "BIH", "MNE", "MKD", "ALB", "UKR", "BLR", "MDA", "ISL",
]);

/** Loads EU country borders as a dashed line layer, animated with GSAP */
export function CountryContours() {
    const { map, isLoaded } = useMap();
    const addedRef = useRef(false);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        if (!isLoaded || !map || addedRef.current) return;
        addedRef.current = true;

        fetch(GEOJSON_URL)
            .then((res) => res.json())
            .then((geojson) => {
                if (!map || map.getSource("europe-contours")) return;

                const europeFeatures = geojson.features.filter(
                    (f: { properties: { ISO_A3: string } }) =>
                        EU_CODES.has(f.properties.ISO_A3),
                );

                map.addSource("europe-contours", {
                    type: "geojson",
                    data: { type: "FeatureCollection", features: europeFeatures },
                });

                map.addLayer(
                    {
                        id: "europe-contours-line",
                        type: "line",
                        source: "europe-contours",
                        paint: {
                            "line-color": "#10b981",
                            "line-width": 1,
                            "line-opacity": 0.2,
                            "line-dasharray": [2, 4],
                        },
                    },
                    map.getStyle().layers?.find((l) => l.type === "symbol")?.id,
                );

                // Animate dash pattern
                const proxy = { step: 0 };
                tweenRef.current = gsap.to(proxy, {
                    step: 6,
                    duration: 8,
                    ease: "none",
                    repeat: -1,
                    onUpdate: () => {
                        try {
                            if (map.getLayer("europe-contours-line")) {
                                const dash = 2 + Math.sin(proxy.step) * 0.5;
                                const gap = 4 + Math.cos(proxy.step) * 0.5;
                                map.setPaintProperty("europe-contours-line", "line-dasharray", [
                                    dash,
                                    gap,
                                ]);
                            }
                        } catch {
                            /* layer might be removed */
                        }
                    },
                });
            })
            .catch(console.error);

        return () => {
            tweenRef.current?.kill();
            try {
                if (map.getLayer("europe-contours-line"))
                    map.removeLayer("europe-contours-line");
                if (map.getSource("europe-contours"))
                    map.removeSource("europe-contours");
            } catch {
                /* ignore */
            }
            addedRef.current = false;
        };
    }, [isLoaded, map]);

    return null;
}
