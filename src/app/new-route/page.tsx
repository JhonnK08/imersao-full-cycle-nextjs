"use client";

import type {
    DirectionsResponseData,
    FindPlaceFromTextResponseData,
} from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef, useState } from "react";
import { useMap } from "../hooks/useMap";

function NewRoutePage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);
    const [directionsData, setDirectionsData] = useState<
        DirectionsResponseData & { request: any }
    >();

    async function createRoute() {
        const startAddress = directionsData!.routes[0].legs[0].start_address;
        const endAddress = directionsData!.routes[0].legs[0].end_address;
        const response = await fetch("http://localhost:3000/routes", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                name: `${startAddress} - ${endAddress}`,
                source_id: directionsData!.request.origin.place_id,
                destination_id: directionsData!.request.destination.place_id,
            }),
        });

        const route = await response.json();
        console.log("route", route);
    }

    async function searchPlaces(event: FormEvent) {
        event.preventDefault();
        const source =
            document.querySelector<HTMLInputElement>("#source")?.value;
        const destination =
            document.querySelector<HTMLInputElement>("#destination")?.value;

        const [sourceResponse, destinationResponse] = await Promise.all([
            fetch(`http://localhost:3000/places?text=${source}`),
            fetch(`http://localhost:3000/places?text=${destination}`),
        ]);

        const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] =
            await Promise.all([
                sourceResponse.json(),
                destinationResponse.json(),
            ]);

        console.log(sourcePlace, destinationPlace);

        if (sourcePlace.status !== "OK") {
            console.error(sourcePlace);
            alert("Não foi possível encontrar a origem");
            return;
        }

        if (destinationPlace.status !== "OK") {
            console.error(destinationPlace);
            alert("Não foi possível encontrar o destino");
            return;
        }

        const placeSourceId = sourcePlace.candidates[0].place_id;
        const placeDestinationId = destinationPlace.candidates[0].place_id;

        const directionsResponse = await fetch(
            `http://localhost:3000/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`
        );
        const newDirectionsData: DirectionsResponseData & { request: any } =
            await directionsResponse.json();
        setDirectionsData(newDirectionsData);

        if (map) {
            map.removeAllRoutes();
            await map.addRouteWithIcons({
                routeId: "1",
                startMarkerOptions: {
                    position:
                        newDirectionsData.routes[0].legs[0].start_location,
                },
                endMarkerOptions: {
                    position: newDirectionsData.routes[0].legs[0].end_location,
                },
                carMarkerOptions: {
                    position:
                        newDirectionsData.routes[0].legs[0].start_location,
                },
            });
        }
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                height: "100%",
                width: "100%",
            }}
        >
            <div>
                <h1>Nova rota</h1>
                <form
                    style={{ display: "flex", flexDirection: "column" }}
                    onSubmit={searchPlaces}
                >
                    <div>
                        <input id="source" type="text" placeholder="Origem" />
                    </div>
                    <div>
                        <input
                            id="destination"
                            type="text"
                            placeholder="Destino"
                        />
                    </div>
                    <button type="submit">Pesquisar</button>
                </form>
                {directionsData && (
                    <ul>
                        <li>
                            Origem{" "}
                            {directionsData.routes[0].legs[0].start_address}
                        </li>
                        <li>
                            Destino{" "}
                            {directionsData.routes[0].legs[0].end_address}
                        </li>
                        <li>
                            <button onClick={createRoute}>Criar rota</button>
                        </li>
                    </ul>
                )}
            </div>
            <div
                id="map"
                style={{
                    height: "100%",
                    width: "100%",
                }}
                ref={mapContainerRef}
            ></div>
        </div>
    );
}

export default NewRoutePage;
