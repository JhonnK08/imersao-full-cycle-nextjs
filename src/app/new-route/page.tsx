"use client";

import type {
    DirectionsResponseData,
    FindPlaceFromTextResponseData,
} from "@googlemaps/google-maps-services-js";
import {
    Alert,
    Button,
    Card,
    CardActions,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { FormEvent, useRef, useState } from "react";
import { useMap } from "../hooks/useMap";

function NewRoutePage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    const [open, setOpen] = useState(false);
    const [directionsData, setDirectionsData] = useState<
        DirectionsResponseData & { request: any }
    >();

    async function createRoute() {
        const startAddress = directionsData!.routes[0].legs[0].start_address;
        const endAddress = directionsData!.routes[0].legs[0].end_address;
        const response = await fetch("http://localhost:3001/api/routes", {
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
        setOpen(true);
    }

    async function searchPlaces(event: FormEvent) {
        event.preventDefault();
        const source =
            document.querySelector<HTMLInputElement>("#source")?.value;
        const destination =
            document.querySelector<HTMLInputElement>("#destination")?.value;

        const [sourceResponse, destinationResponse] = await Promise.all([
            fetch(`http://localhost:3001/api/places?text=${source}`),
            fetch(`http://localhost:3001/api/places?text=${destination}`),
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
            `http://localhost:3001/api/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`
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
        <Grid2 container sx={{ display: "flex", flex: 1 }}>
            <Grid2 xs={4} px={2}>
                <Typography variant="h4">Nova rota</Typography>
                <form onSubmit={searchPlaces}>
                    <TextField id="source" label="Origem" fullWidth />
                    <TextField
                        id="destination"
                        label="Destino"
                        fullWidth
                        sx={{ mt: 1 }}
                    />
                    <Button
                        variant="contained"
                        type="submit"
                        sx={{ mt: 1 }}
                        fullWidth
                    >
                        Pesquisar
                    </Button>
                </form>
                {directionsData && (
                    <Card sx={{ mt: 1 }}>
                        <CardContent>
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary={"Origem"}
                                        secondary={
                                            directionsData.routes[0].legs[0]
                                                .start_address
                                        }
                                    ></ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={"Destino"}
                                        secondary={
                                            directionsData.routes[0].legs[0]
                                                .end_address
                                        }
                                    ></ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={"Distância"}
                                        secondary={
                                            directionsData.routes[0].legs[0]
                                                .distance.text
                                        }
                                    ></ListItemText>
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={"Duração"}
                                        secondary={
                                            directionsData.routes[0].legs[0]
                                                .duration.text
                                        }
                                    ></ListItemText>
                                </ListItem>
                            </List>
                        </CardContent>
                        <CardActions
                            sx={{ display: "flex", justifyContent: "center" }}
                        >
                            <Button
                                type="button"
                                variant="contained"
                                onClick={createRoute}
                            >
                                Adicionar rota
                            </Button>
                        </CardActions>
                    </Card>
                )}
            </Grid2>
            <Grid2 id="map" ref={mapContainerRef} xs={8} />
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity="success">
                    Rota cadastrada com sucesso
                </Alert>
            </Snackbar>
        </Grid2>
    );
}

export default NewRoutePage;
