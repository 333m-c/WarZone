import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapboxMap({ token, lat = [], lng = [] }) {
    mapboxgl.accessToken = token;

    const mapContainer = useRef(null);
    const mapRef = useRef(null);           // ⭐ เก็บ instance map
    const markerSourceRef = useRef(null);  // ⭐ เก็บ source ของ marker
    console.log(lat)
    console.log(lng)
    // 🔥 สร้าง Map ครั้งเดียวเท่านั้น
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

            map.loadImage(
                "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
                (error, image) => {
                    if (error) throw error;
                    if (!map.hasImage("marker-icon")) {
                        map.addImage("marker-icon", image);
                    }

                    // ⭐ addSource ครั้งเดียว
                    map.addSource("markers", {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: []
                        }
                    });

                    markerSourceRef.current = map.getSource("markers");

                    map.addLayer({
                        id: "marker-layer",
                        type: "symbol",
                        source: "markers",
                        layout: {
                            "icon-image": "marker-icon",
                            "icon-size": 0.5,
                            "icon-anchor": "bottom",
                        },
                    });

                    // ⭐⭐⭐ สร้างหมุดทันทีหลัง map สร้างเสร็จ ⭐⭐⭐
                    if (lat.length > 0 && lng.length > 0) {
                        const features = lat.map((la, i) => ({
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [lng[i], la],
                            },
                        }));

                        markerSourceRef.current.setData({
                            type: "FeatureCollection",
                            features,
                        });

                        map.flyTo({
                            center: [lng[0], lat[0]],
                            zoom: 16,
                            duration: 600
                        });
                    }
                }
            );
        });

        return () => map.remove();
    }, []);

    // 🔥 อัปเดตตำแหน่ง marker เวลา lat/lng เปลี่ยน
    useEffect(() => {
        if (!mapRef.current) return;
        if (!markerSourceRef.current) return;

        if (lat.length === 0 || lng.length === 0) return;

        const features = lat.map((la, i) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lng[i], la],
            },
        }));

        // ⭐ อัปเดต source data — ไม่ rebuild map
        markerSourceRef.current.setData({
            type: "FeatureCollection",
            features,
        });

        // ⭐ เลื่อนไปจุดแรกอย่าง smooth ไม่กระพริบ
        mapRef.current.flyTo({
            center: [lng[0], lat[0]],
            zoom: 16,
            duration: 600
        });

    }, [lat, lng]);

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
