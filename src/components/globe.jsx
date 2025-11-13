
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as topojson from "topojson-client";
import { use, useEffect, useRef, useState } from "react"; // ✅ เพิ่ม useState
import Card from "./card/card"
import data from "../data/contries_data.json"
import { useDetectionContext } from "../hooks/detectionContext";
import Navbar from "./navbar/navbar";
import { useParams } from "react-router-dom";
import Overall from "./dashbordOverall/overall";
import LogBox from "./logComponents/logBox";
import Offence from "./dashbordOffence/overall";
import Defence from "./dashbordDef/overall";


export default function Globe() {
    const { realtimeDefenceData, realtimeOffenceData,defenceHistory,offenceHistory,defenceDaily,offenceDaily, isConnectedDefence,isConnectedOffence, isLoadingDefence,isLoadingOffence, } = useDetectionContext();
    const { type } = useParams();
    const [dashboard,setDashboard] = useState()
    // console.log(isLoading)
    // console.log(isConnected)
    // console.log(realtimeData)
    // console.log(allHistory)
    // console.log(realtimeData.objects)
    const globeRef = useRef(null);
    const [isLocked, setIsLocked] = useState(true); // ✅ เก็บสถานะล็อกกล้อง
    const [displayCard, setDisplayCard] = useState(null)
    const [displayLog,setDisplayLog] = useState(null)
    const [selectedMarkerData, setSelectedMarkerData] = useState(null);
    const bangkok = latLngToVector3(13.7563, 100.5018, 100);
    const bangkokE = latLngToVector3(13.7563, 100.5018, 1);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    // === Helper: lat/lon -> 3D position ===
    function latLngToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 90) * (Math.PI / 180);
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        return new THREE.Vector3(x, y, z);
    }
    const cameraRef = useRef();
    const rendererRef = useRef();
    const globeObjRef = useRef();
    
    useEffect(() => {
        if (!globeRef) return;

        // === Scene setup ===

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        globeRef.current.appendChild(renderer.domElement);

        // === Lighting ===
        const ambient = new THREE.AmbientLight(0xffffff, 1.3);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(1, 1, 1);
        scene.add(ambient, dir);

        // === Globe ===
        const globe = new ThreeGlobe()
            .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
            .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png");

        scene.add(globe);
        // ✅ เก็บไว้ใน useRef เพื่อใช้ต่อใน effect อื่น
        cameraRef.current = camera;
        rendererRef.current = renderer;
        globeObjRef.current = globe;
        // === Controls ===
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minPolarAngle = Math.PI / 2.5;
        controls.maxPolarAngle = Math.PI / 1.5;

        // ✅ เริ่มต้นที่ประเทศไทย

        camera.position.set(bangkok.x * 1.3, bangkok.y * 1.3, bangkok.z * 1.3);
        controls.target.copy(bangkok);
        controls.update();

        // ✅ ถ้า isLocked เริ่มต้นเป็น true — กล้องล็อกเลย
        if (isLocked) {
            controls.enableRotate = false;
            controls.enableZoom = false;
            controls.enablePan = false;
        }

        // === Countries ===
        const countries = topojson.feature(data, data.objects.countries)
            .features;
        globe
            .polygonsData(countries)
            .polygonCapColor(() => "rgba(100,150,255,0.4)")
            .polygonSideColor(() => "rgba(0,0,80,0.15)")
            .polygonStrokeColor(() => "#e4ce5694")
            .showAtmosphere(true)
            .atmosphereColor("lightskyblue");


        const toRemove = [];
        globe.children.forEach((child) => {
            if (child.userData && child.userData.objects) {
                toRemove.push(child);
            }
        });
        toRemove.forEach((marker) => {
            globe.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
        });

        const animate = () => {
            requestAnimationFrame(animate);

            // ✅ ให้โลกหมุนตลอดเวลา (ตามแกน Y)
            // globe.rotation.y += 0.0008;

            // === ปรับขนาดหมุดตามระยะกล้อง ===
            // let distance = camera.position.length();
            // distance = distance > 300 ? distance : 300 - distance;
            // markerMeshes.forEach((mesh) => {
            // let scale = (scaleFactor / distance) * baseScale;
            // if (scale > 2){
            //     scale =2
            // }
            // mesh.scale.set(scale, scale, scale);
            // });

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        globeRef.current.__camera = camera;
        globeRef.current.__controls = controls;
        globeRef.current.__bangkok = bangkok; // ✅ เก็บตำแหน่งไว้ใช้กับปุ่ม

        return () => {
            renderer.dispose();
            window.removeEventListener("resize", () => { });
        };
    }, []); // ✅ เพิ่ม dependency

    useEffect(() => {
        const globe = globeObjRef.current;
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        if (!globe || !renderer || !camera) return;
        // console.log(isConnectedDefence)
        // console.log(isConnectedOffence)
        // console.log(isLoading)
        // console.log(isConnected)
        // console.log(realtimeData)
        // console.log(defenceHistory)
        // console.log(defenceDaily)
        // console.log(offenceDaily)
        // console.log(realtimeDefenceData)
        // console.log(realtimeOffenceData)
        // === ลบ marker เดิมก่อน ===
        const toRemove = globe.children.filter((child) => child.userData?.objects);
        toRemove.forEach((marker) => {
            globe.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
        });
        // === Markers ===
        // const markers = [
        //     { lat: 13.7563, lng: 100.5018, color: "red", name: "Bangkok" },
        //     { lat: 35.6895, lng: 139.6917, color: "blue", name: "Tokyo" },
        //     { lat: 40.7128, lng: -74.006, color: "green", name: "New York" },
        //     { lat: 51.5074, lng: -0.1278, color: "yellow", name: "London" },
        // ];
        const markerMeshes = [];
        const globeRadius = 100;
        if (type == "defence" || type == "overall"){
            let markers = []
            if (realtimeDefenceData) {
                markers.push(realtimeDefenceData)
            }


            

            markers.forEach((m) => {
                const pos = latLngToVector3(m.objects[0].lat, m.objects[0].lng, globeRadius + 1.5);
                const geom = new THREE.SphereGeometry(0.5, 16, 16);
                //const mat = new THREE.MeshStandardMaterial({ color: m.color, emissive: m.color });
                const mat = new THREE.MeshStandardMaterial({ color: "red", emissive: "red" });
                const mesh = new THREE.Mesh(geom, mat);
                mesh.userData = (m)
                mesh.position.copy(pos);
                globe.add(mesh);
                markerMeshes.push(mesh);

            });
        }
        if (type == "offence" || type == "overall"){
            let markers = []
            if (realtimeOffenceData) {
                markers.push(realtimeOffenceData)
            }


            

            markers.forEach((m) => {
                const pos = latLngToVector3(m.objects[0].lat, m.objects[0].lng, globeRadius + 1.5);
                const geom = new THREE.SphereGeometry(0.5, 16, 16);
                //const mat = new THREE.MeshStandardMaterial({ color: m.color, emissive: m.color });
                const mat = new THREE.MeshStandardMaterial({ color: "green", emissive: "green" });
                const mesh = new THREE.Mesh(geom, mat);
                mesh.userData = (m)
                mesh.position.copy(pos);
                globe.add(mesh);
                markerMeshes.push(mesh);
                
            });
        }
        if (type == "defence"){
            setDashboard(<Defence/>)
            setDisplayLog(<LogBox history={defenceHistory} theme={"red"} haddleClick={setDisplayCard} haddleDisplay={()=>setDisplayCard(null)}/>)
            THREE.Cache.clear();
        }
        else if (type == "offence"){
            setDashboard(<Offence/>)
            setDisplayLog(<LogBox history={offenceHistory} theme={"green"} haddleClick={setDisplayCard} haddleDisplay={()=>setDisplayCard(null)}/>)
            THREE.Cache.clear();
        }
        else if (type == "overall"){
            setDisplayLog(null)
            setDashboard(<Overall realtimeDefenceData={realtimeDefenceData} realtimeOffenceData={realtimeOffenceData} defenceDaily={defenceDaily} offenceDaily={offenceDaily}/>)
            THREE.Cache.clear();
        }

        // === Click handler ===
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        renderer.domElement.addEventListener("click", (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(markerMeshes);
            
            if (intersects.length > 0) {
                const clicked = intersects[0].object;
                const latList = clicked.userData.objects.map(o => o.lat);
                const lngList = clicked.userData.objects.map(o => o.lng);
                // console.log(latList,lngList)
                setSelectedMarkerData(clicked.userData);
                // setDisplayCard(<Card name={clicked.userData.objects[0].obj_id} lat={latList} lng={lngList} handleClose ={()=>{setDisplayCard(null)}} img={clicked.userData.image.path} timestamp={clicked.userData.timestamp}/>)
                // console.log(clicked.userData.objects.length)
            }

        });

        const baseScale = 1.5;
        const scaleFactor = 20;
        const animate = () => {
            requestAnimationFrame(animate);

            // ✅ ให้โลกหมุนตลอดเวลา (ตามแกน Y)
            // globe.rotation.y += 0.0008;

            // === ปรับขนาดหมุดตามระยะกล้อง ===
            let distance = camera.position.length();
            distance = distance > 300 ? distance : 300 - distance;
            markerMeshes.forEach((mesh) => {
                let scale = (scaleFactor / distance) * baseScale;
                if (scale > 2) {
                    scale = 2
                }
                mesh.scale.set(scale, scale, scale);
            });
        };
        animate();
    }, [realtimeDefenceData,realtimeOffenceData,type,isConnectedDefence,isConnectedOffence])

    useEffect(() => {
        if (!selectedMarkerData) return;

        // defence update
        if (
            realtimeDefenceData &&
            realtimeDefenceData.objects[0].obj_id === selectedMarkerData.objects[0].obj_id
        ) {
            setSelectedMarkerData(realtimeDefenceData);
        }

        // offence update
        if (
            realtimeOffenceData &&
            realtimeOffenceData.objects[0].obj_id === selectedMarkerData.objects[0].obj_id
        ) {
            setSelectedMarkerData(realtimeOffenceData);
        }
    }, [realtimeDefenceData, realtimeOffenceData]);
    
    return (
        <>
            <Navbar/>
            <div style={{ position: "relative" }}>
                <div ref={globeRef} style={{ width: "100vw", height: "100vh" }} />

                {/* ✅ ปุ่ม toggle ล็อก/ปลดล็อก */}
                <button
                    onClick={() => {
                        const camera = globeRef.current.__camera;
                        const controls = globeRef.current.__controls;
                        if (!camera || !controls) return;

                        if (!isLocked) {
                            // 🔒 ล็อกกล้อง

                            controls.enableRotate = false;
                            controls.enableZoom = false;
                            controls.enablePan = false;
                            camera.position.set(bangkok.x * 1.3, bangkok.y * 1.3, bangkok.z * 1.3);
                            controls.target.copy(bangkok);
                            controls.update();
                        } else {
                            // 🔓 ปลดล็อก
                            camera.position.set(bangkok.x * 2, bangkok.y * 2, bangkok.z * 2);
                            controls.target.copy(bangkokE);
                            controls.update();
                            controls.enableRotate = true;
                            controls.enableZoom = true;
                            controls.enablePan = false;
                        }
                        setIsLocked(!isLocked);
                    }}
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        padding: "10px 20px",
                        fontSize: "16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: isLocked ? "#ff5050" : "#50c878",
                        color: "white",
                        border: "none",
                    }}
                >
                    {isLocked ? "🔒 Locked" : "🔓 Unlock"}
                </button>
                {selectedMarkerData && (
                    <Card
                        name={selectedMarkerData.objects[0].obj_id}
                        lat={selectedMarkerData.objects.map(o => o.lat)}
                        lng={selectedMarkerData.objects.map(o => o.lng)}
                        img={selectedMarkerData.image.path}
                        timestamp={selectedMarkerData.timestamp}
                        handleClose={() => setSelectedMarkerData(null)}
                    />
                )}
                {displayCard}
                
                
            </div>
            {dashboard}
                
            {displayLog}
        </>);
}
