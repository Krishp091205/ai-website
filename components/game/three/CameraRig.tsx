"use client";

/* eslint-disable react-hooks/immutability -- R3F per-frame camera control is the intended pattern */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { IS_MOBILE, useGame } from "../store";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function CameraRig() {
  const { camera } = useThree();
  const fovSetting = useGame((s) => s.settings.fov);

  const pos = useRef(new THREE.Vector3(0, 1.62, 6));
  const smoothYaw = useRef(0);
  const smoothPitch = useRef(-0.05);
  const targetYaw = useRef(0);
  const targetPitch = useRef(-0.05);
  const flyFrom = useRef(new THREE.Vector3());
  const currentFly = useRef(0);
  const bob = useRef(0);

  // mouse parallax on non-locked fine pointer for menus (subtle)
  const par = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      par.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      par.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const now = performance.now();
    const st = useGame.getState();
    const t = (now - currentFly.current) / 1000;

    // Smooth FOV
    const targetFov = fovSetting;
    const player = state.camera.userData;
    const sprinting = player && player.velLen > 6;
    const fovK = 1 - Math.pow(0.001, delta);
    const pcam = camera as THREE.PerspectiveCamera;
    if (pcam.isPerspectiveCamera) {
      pcam.fov += (targetFov + (sprinting ? 5 : 0) - pcam.fov) * fovK;
      pcam.updateProjectionMatrix();
    }

    // ---- Portal cinematic fly ----
    const ft = st.flyTarget;
    if (ft) {
      if (currentFly.current !== undefined && flyFrom.current && t < 10) {
        const dur = IS_MOBILE ? 0.5 : 0.55;
        const p = Math.min(1, t / dur);
        const e = easeInOutCubic(p);
        const to = new THREE.Vector3(...ft.to);
        pos.current.copy(flyFrom.current.clone().lerp(to, e));
        const look = new THREE.Vector3(...ft.look);
        pos.current.lerp(to, e);
        camera.position.copy(pos.current);
        camera.lookAt(look);
      }
      if (t >= 0.6 && !st.portalOpen) {
        useGame.getState().completeFly();
        return;
      }
      return;
    }

    // ---- Free movement ----
    targetYaw.current = player?.yaw ?? targetYaw.current;
    targetPitch.current = player?.pitch ?? targetPitch.current;

    // smooth interpolation with slight inertia (no snapping)
    const lookK = 1 - Math.pow(0.00012, delta);
    smoothYaw.current += (targetYaw.current - smoothYaw.current) * lookK;
    smoothPitch.current += (targetPitch.current - smoothPitch.current) * lookK;

    const eye = player?.eye ?? 1.62;
    const basePos = player?.playerPos
      ? (player.playerPos as THREE.Vector3)
      : new THREE.Vector3(st.playerPos[0], st.playerPos[1], st.playerPos[2]);

    const speed = player?.velLen ?? 0;
    const moving = speed > 0.4;
    if (moving) bob.current += delta * (sprinting ? 14 : 9);
    const bobAmt = Math.sin(bob.current) * (moving ? 0.03 : 0);

    if (st.viewMode === "first") {
      // First-person at eye height
      const px = basePos.x + par.current.x * 0.02;
      const py = basePos.y + eye + bobAmt;
      const pz = basePos.z + par.current.y * 0.02;
      const damp = 1 - Math.pow(0.0006, delta);
      pos.current.x += (px - pos.current.x) * damp;
      pos.current.y += (py - pos.current.y) * damp;
      pos.current.z += (pz - pos.current.z) * damp;
      camera.position.copy(pos.current);
      camera.rotation.order = "YXZ";
      camera.rotation.y = smoothYaw.current;
      camera.rotation.x = smoothPitch.current;
      camera.rotation.z = 0;
    } else {
      // Third-person follow with smooth orbit
      const dist = 3.6;
      const cosY = Math.cos(smoothYaw.current);
      const sinY = Math.sin(smoothYaw.current);
      const cosP = Math.cos(smoothPitch.current + 0.08);
      const sinP = Math.sin(smoothPitch.current + 0.08);
      const offset = new THREE.Vector3(
        -sinY * cosP * dist,
        sinP * dist + 0.6,
        -cosY * cosP * dist
      );
      const desired = basePos.clone().add(offset);
      const damp = 1 - Math.pow(0.0004, delta);
      pos.current.x += (desired.x - pos.current.x) * damp;
      pos.current.y += (desired.y - pos.current.y) * damp;
      pos.current.z += (desired.z - pos.current.z) * damp;
      camera.position.copy(pos.current);
      const lookAt = basePos.clone().add(new THREE.Vector3(0, 1.35, 0));
      camera.lookAt(lookAt);
      // subtle orbit lag on yaw
      camera.rotation.y = smoothYaw.current;
    }
  });

  // reset fly start when a new flyTarget appears
  useEffect(() => {
    flyFrom.current.copy(camera.position);
    currentFly.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useGame((s) => s.flyTarget?.mode)]);

  return null;
}
