"use client";

import {
    Map,
    MapMarker,
    MarkerContent,
    MapRoute,
} from "@/components/ui/map";

import type { EuropeMapProps } from "./types";
import { DEFAULT_CITIES, DEFAULT_CONNECTIONS } from "./data";
import { MAP_STYLES } from "./styles";
import { getCityCoords } from "./utils";
import { PulseMarker } from "./pulse-marker";
import { CountryContours } from "./country-contours";
import { EventAnimations } from "./event-animations";
import { useEventQueue } from "./use-event-queue";

export default function EuropeMap({
    cities = DEFAULT_CITIES,
    connections = DEFAULT_CONNECTIONS,
    children,
    theme = "dark",
    center = [15, 50],
    zoom = 3.5,
    apiUrl,
    queueInterval,
    className,
}: EuropeMapProps) {
    const { events } = useEventQueue({
        apiUrl,
        interval: queueInterval,
    });

    return (
        <>
            <style>{MAP_STYLES}</style>
            <div
                className={`relative w-full min-h-[700px] max-md:min-h-[500px] overflow-hidden ${className ?? ""}`}
            >
                {/* Left: overlay content */}
                {children && (
                    <div className="relative z-10 max-w-[600px] py-24 pl-20 max-md:max-w-full max-md:pl-0 max-md:py-15 max-md:text-center">
                        {children}
                    </div>
                )}

                {/* Right: map background */}
                <div className="absolute top-0 right-0 w-[60%] h-full max-md:w-full max-md:opacity-30">
                    <div className="eu-map-wrap absolute inset-0 overflow-hidden bg-[#0a0a0a]">
                        {/* Fades */}
                        <div className="eu-vignette absolute inset-0 pointer-events-none z-10" />
                        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10" />

                        <Map
                            theme={theme}
                            center={center}
                            zoom={zoom}
                            minZoom={3}
                            maxZoom={6}
                            dragPan={false}
                            scrollZoom={false}
                            doubleClickZoom={false}
                            touchZoomRotate={false}
                            keyboard={false}
                            dragRotate={false}
                            pitchWithRotate={false}
                            touchPitch={false}
                            className="w-full h-full"
                        >
                            <CountryContours />

                            <EventAnimations events={events} cities={cities} />

                            {/* Route lines */}
                            {connections.map(([from, to], i) => {
                                const fromCoords = getCityCoords(cities, from);
                                const toCoords = getCityCoords(cities, to);
                                return (
                                    <MapRoute
                                        key={`route-${from}-${to}`}
                                        id={`eu-route-${i}`}
                                        coordinates={[fromCoords, toCoords]}
                                        color="#10b981"
                                        width={1}
                                        opacity={0.15}
                                        dashArray={[4, 8]}
                                        interactive={false}
                                    />
                                );
                            })}



                            {/* City markers */}
                            {cities.map((city) => (
                                <MapMarker
                                    key={city.name}
                                    longitude={city.lng}
                                    latitude={city.lat}
                                >
                                    <MarkerContent>
                                        <PulseMarker name={city.name} />
                                    </MarkerContent>
                                </MapMarker>
                            ))}
                        </Map>
                    </div>
                </div>
            </div>
        </>
    );
}
