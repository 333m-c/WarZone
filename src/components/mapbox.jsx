import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapboxMap({ token, lat = [], lng = [], color = "rgba(248, 65, 65, 1)" }) {
    mapboxgl.accessToken = token;

    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markerSourceRef = useRef(null);

    // ⭐ สร้างแผนที่ครั้งเดียว
    useEffect(() => {
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/satellite-streets-v12",
            center: [lng[0] || 100.5, lat[0] || 13.7],
            zoom: 15,
            projection: "globe",
        });

        mapRef.current = map;

        map.on("style.load", () => {
            map.setFog({
                color: "rgba(240,245,255,0.25)",
                "high-color": "rgba(255,255,255,0.95)",
                "space-color": "white",
                "horizon-blend": 0.6,
                "star-intensity": 0,
            });

            // ⭐ create source once
            map.addSource("markers", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: []
                }
            });

            markerSourceRef.current = map.getSource("markers");

            // ⭐⭐ ใช้ circle layer เพื่อให้เปลี่ยนสีได้ ⭐⭐
            map.addLayer({
                id: "marker-layer",
                type: "circle",
                source: "markers",
                paint: {
                    "circle-radius": 10,
                    "circle-color": ["get", "color"],   // ← ใช้สีจาก properties
                    "circle-opacity": 0.9,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff"
                }
            });

            // ⭐ ใส่หมุดครั้งแรก
            if (lat.length > 0 && lng.length > 0) {
                const features = lat.map((la, i) => ({
                    type: "Feature",
                    properties: {
                        color: color // ← ใช้สีที่ส่งเข้ามา
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [lng[i], la]
                    }
                }));

                markerSourceRef.current.setData({
                    type: "FeatureCollection",
                    features
                });

                map.flyTo({
                    center: [lng[0], lat[0]],
                    zoom: 16,
                    duration: 600
                });
            }
        });

        return () => map.remove();
    }, []);

    // ⭐ อัปเดตหมุดเมื่อ lat/lng หรือ color เปลี่ยน
    useEffect(() => {
        if (!mapRef.current) return;
        if (!markerSourceRef.current) return;
        if (lat.length === 0 || lng.length === 0) return;

        const features = lat.map((la, i) => ({
            type: "Feature",
            properties: {
                color: color   // ← เปลี่ยนสี runtime ได้เลย!
            },
            geometry: {
                type: "Point",
                coordinates: [lng[i], la],
            },
        }));

        markerSourceRef.current.setData({
            type: "FeatureCollection",
            features
        });

        mapRef.current.flyTo({
            center: [lng[0], lat[0]],
            zoom: 16,
            duration: 600
        });

    }, [lat, lng, color]);

    return (
        <div
            ref={mapContainer}
            style={{
                width: "48%",
                height: "80%",
                border: "3px solid #fff",
                borderRadius: "12px",
                overflow: "hidden"
            }}
        />
    );
}
