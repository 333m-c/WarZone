import { useEffect, useRef } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as topojson from "topojson-client";
import data from "../../data/contries_data.json";

export default function GlobeCanvas({ realtimeDefenceData, realtimeOffenceData }) {
  const globeRef = useRef(null);
  const globeInstance = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // === สร้าง Scene และ Globe แค่ครั้งเดียวตอน mount ===
  useEffect(() => {
    const container = globeRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 300;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x1a1a1a); // เปลี่ยนสีพื้นหลัง
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Globe
    const globe = new ThreeGlobe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png");

    const countries = topojson.feature(data, data.objects.countries).features;
    globe
      .polygonsData(countries)
      .polygonCapColor(() => "rgba(100,150,255,0.4)")
      .polygonSideColor(() => "rgba(0,0,80,0.15)")
      .polygonStrokeColor(() => "#333")
      .showAtmosphere(true)
      .atmosphereColor("lightskyblue");

    globeInstance.current = globe;
    scene.add(globe);

    // Light
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(1, 1, 1);
    scene.add(ambient, directional);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.05;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []); // 👈 run only once when mounted

  // === อัปเดตหมุดทุกครั้งที่ props เปลี่ยน ===
  useEffect(() => {
    const globe = globeInstance.current;
    if (!globe) return;

    // Clear cache และลบหมุดเก่า
    THREE.Cache.clear();
    globe.pointsData([]); // เคลียร์หมุดเก่าออก

    const markers = [];

    if (realtimeDefenceData?.objects) {
      realtimeDefenceData.objects.forEach((object) => {
        markers.push({
          name: object.obj_id,
          lat: object.lat,
          lng: object.lng,
          size: 0.6,
          color: "red",
        });
      });
    }

    if (realtimeOffenceData?.objects) {
      realtimeOffenceData.objects.forEach((object) => {
        markers.push({
          name: object.obj_id,
          lat: object.lat,
          lng: object.lng,
          size: 0.6,
          color: "green",
        });
      });
    }

    globe
      .pointsData(markers)
      .pointAltitude("size")
      .pointColor("color");
  }, [realtimeDefenceData, realtimeOffenceData]);

  return (
    <div
      ref={globeRef}
      style={{
        width: "70%",
        height: "30%",
        backgroundColor: "rgba(46, 45, 45, 0.719)",
        border: "1px solid #999",
        marginTop: "3rem",
        marginLeft: "4rem",
      }}
    />
  );
}
