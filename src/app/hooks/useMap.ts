import { Loader } from "@googlemaps/js-api-loader";
import { RefObject, useEffect, useState } from "react";
import { getCurrentPosition } from "../utils/geolocation";
import { Map } from "../utils/map";

export function useMap(containerRef: RefObject<HTMLDivElement>) {
    const [map, setMap] = useState<Map>();

    useEffect(() => {
        (async () => {
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
                libraries: ["routes", "geometry"],
            });

            const [_, __, position] = await Promise.all([
                loader.importLibrary("routes"),
                loader.importLibrary("geometry"),
                getCurrentPosition({ enableHighAccuracy: true }),
            ]);

            const newMap = new Map(containerRef.current!, {
                zoom: 15,
                center: position,
            });
            setMap(newMap);
        })();
    }, [containerRef]);

    return map;
}
