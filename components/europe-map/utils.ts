import type { MapCity } from "./types";

/** Resolve [lng, lat] from a city name */
export function getCityCoords(
    cities: MapCity[],
    name: string,
): [number, number] {
    const city = cities.find((c) => c.name === name);
    return city ? [city.lng, city.lat] : [0, 0];
}
