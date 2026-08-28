"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../store";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function CameraRig() {
  const cameraMode = useGame((s) => s.cameraMode);
  const flyTarget = useGame((s) => s.flyTarget);
  const { camera } = useThree();

  const modeRef = useRef(cameraMode);
  const start = useRef(0);
  const fromPos = useRef(new THREE.Vector3());
  const fromLook = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3(0, 3.4, 21));
  const look = useRef(new THREE.Vector3(0, 1.8, 0));
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (modeRef.current === cameraMode) return;
    fromPos.current.copy(camera.position);
    fromLook.current.copy(look.current);
    start.current = performance.now();
    modeRef.current = cameraMode;
  }, [cameraMode, camera]);

  useEffect(() => {
    pos.current.copy(camera.position);
  }, [camera]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = (performance.now() - start.current) / 1000;
    const now = performance.now();
    const k = 1 - Math.pow(0.0015, delta);

    const hubPos = () =>
      new THREE.Vector3(
        Math.sin(now * 0.00005) * 0.9 + mouse.current.x * 1.1,
        2.45 + Math.sin(now * 0.0004) * 0.18,
        10.6 + Math.cos(now * 0.00005) * 0.8 - mouse.current.y * 0.5
      );
    const hubLook = () => new THREE.Vector3(0, 1.7, -0.5);

    switch (cameraMode) {
      case "intro": {
        const p = Math.min(1, t / 6.5);
        const e = easeInOutCubic(p);
        const target = new THREE.Vector3(
          Math.sin(t * 0.22) * 0.6 * (1 - e),
          THREE.MathUtils.lerp(3.6, 2.4, e),
          THREE.MathUtils.lerp(21, 9.4, e)
        );
        pos.current.lerp(target, k);
        const l = new THREE.Vector3(0, 1.8, 0);
        look.current.lerp(l, k);
        break;
      }
      case "hub": {
        pos.current.lerp(hubPos(), k);
        look.current.lerp(hubLook(), k);
        break;
      }
      case "flyIn": {
        if (!flyTarget) break;
        const dur = 1.5;
        const p = Math.min(1, t / dur);
        const e = easeInOutCubic(p);
        pos.current.copy(
          fromPos.current.clone().lerp(new THREE.Vector3(...flyTarget.to), e)
        );
        look.current.copy(
          fromLook.current.clone().lerp(new THREE.Vector3(...flyTarget.look), e)
        );
        break;
      }
      case "flyOut": {
        const dur = 1.2;
        const p = Math.min(1, t / dur);
        const e = easeInOutCubic(p);
        pos.current.copy(fromPos.current.clone().lerp(hubPos(), e));
        look.current.copy(fromLook.current.clone().lerp(hubLook(), e));
        break;
      }
      case "content": {
        look.current.lerp(new THREE.Vector3(0, 1.7, 0), k * 0.2);
        break;
      }
    }

    camera.position.copy(pos.current);
    camera.lookAt(look.current);
  });

  return null;
}
