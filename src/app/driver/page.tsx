"use client";

import { Button, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useRef } from "react";
import { RouteSelect } from "../components/RouteSelect";
import { useMap } from "../hooks/useMap";
import { Route } from "../utils/model";
import { sleep } from "../utils/sleep";
import { socket } from "../utils/socket-io";

function DriverPage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    async function startRoute() {
        const routeId = (
            document.querySelector<HTMLSelectElement>(
                "#route"
            ) as HTMLSelectElement
        ).value;
        const response = await fetch(
            `http://localhost:3001/api/routes/${routeId}`
        );
        const route: Route = await response.json();

        if (map) {
            map.removeAllRoutes();
            await map.addRouteWithIcons({
                routeId: routeId,
                startMarkerOptions: {
                    position: route.directions.routes[0].legs[0].start_location,
                },
                endMarkerOptions: {
                    position: route.directions.routes[0].legs[0].end_location,
                },
                carMarkerOptions: {
                    position: route.directions.routes[0].legs[0].start_location,
                },
            });
            const { steps } = route.directions.routes[0].legs[0];

            for (const step of steps) {
                await sleep(2000);
                map.moveCar(routeId, step.start_location);
                socket.emit("new-points", {
                    route_id: routeId,
                    lat: step.start_location.lat,
                    lng: step.start_location.lng,
                });

                await sleep(2000);
                map.moveCar(routeId, step.end_location);
                socket.emit("new-points", {
                    route_id: routeId,
                    lat: step.end_location.lat,
                    lng: step.end_location.lng,
                });
            }
        }
    }

    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <Grid2 container sx={{ display: "flex", flex: 1 }}>
            <Grid2 xs={4} px={2}>
                <Typography variant="h4">Minha viagem</Typography>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <RouteSelect id="route" />
                    <Button variant="contained" onClick={startRoute} fullWidth>
                        Iniciar a viagem
                    </Button>
                </div>
            </Grid2>
            <Grid2 id="map" ref={mapContainerRef} xs={8} />
        </Grid2>
    );
}

export default DriverPage;
