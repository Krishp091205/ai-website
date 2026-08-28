"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLLISION_MAP, PROPS, ROOM_BY_ID, TERMINALS } from "./level";
import { useGame, type WorldZoneId } from "./store";
import { useInput } from "./input";
import { sound } from "./sound";
import { IS_MOBILE } from "./store";

const PLAYER_RADIUS = 0.5;
const ACCEL = 60;
const DECEL = 55;
const MAX_SPEED = 5.5;
const SPRINT_MULT = 1.7;
const JUMP_VELOCITY = 6.2;
const GRAVITY = 16;
const EYE_HEIGHT = 1.62;

interface InteractTarget {
  id: string;
  label: string;
  sub: string;
  accent: string;
  xp: number;
  terminal?: string;
}

export default function PlayerController() {
  const pos = useRef(new THREE.Vector3(...useGame.getState().playerPos));
  const vel = useRef(new THREE.Vector3());
  const yaw = useRef(useGame.getState().playerRot);
  const pitch = useRef(-0.05);
  const onGround = useRef(true);
  const target = useRef<InteractTarget | null>(null);

  const settings = useGame((s) => s.settings);

  const zoneAt = (x: number, z: number): WorldZoneId => {
    const ids: WorldZoneId[] = ["cardio", "strength", "recovery", "weights", "functional", "exit"];
    for (const id of ids) {
      const m = ROOM_BY_ID[id];
      if (x >= m.x0 && x <= m.x1 && z >= m.z0 && z <= m.z1) return id;
    }
    return "entry";
  };

  const findTarget = (): InteractTarget | null => {
    const p = pos.current;
    let best: InteractTarget | null = null;
    let bestD = Infinity;
    for (const pr of PROPS) {
      const d = Math.hypot(p.x - pr.position[0], p.z - pr.position[2]);
      if (d <= pr.radius && d < bestD) {
        bestD = d;
        best = { id: `p:${pr.label}@${pr.position[0].toFixed(1)},${pr.position[2].toFixed(1)}`, label: pr.label, sub: pr.sub, accent: pr.accent, xp: pr.xp };
      }
    }
    for (const t of TERMINALS) {
      const d = Math.hypot(p.x - t.position[0], p.z - t.position[2]);
      if (d <= t.radius && d < bestD) {
        bestD = d;
        best = { id: `t:${t.id}`, label: t.label.toUpperCase(), sub: `ACCESS ${t.label.toUpperCase()}`, accent: t.accent, xp: 6, terminal: t.id };
      }
    }
    return best;
  };

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.033);
    const st = useGame.getState();
    const input = useInput.getState();
    if (st.portalOpen || st.screen !== "gym") return;

    // ---- rotation from look ----
    const sens = settings.mouseSensitivity * 0.0022 * (IS_MOBILE ? 1.6 : 1);
    if (Math.abs(input.lookX) > 0) {
      yaw.current -= input.lookX * sens;
      useInput.setState({ lookX: 0 });
    }
    if (Math.abs(input.lookY) > 0) {
      pitch.current -= input.lookY * sens;
      pitch.current = THREE.MathUtils.clamp(pitch.current, -1.35, 1.35);
      useInput.setState({ lookY: 0 });
    }

    // ---- movement input ----
    let fwd = input.fwd;
    let strafe = input.strafe;
    if (IS_MOBILE && input.joyActive) {
      fwd = -input.joy.y;
      strafe = input.joy.x;
    }
    const len = Math.hypot(fwd, strafe);
    if (len > 1) { fwd /= len; strafe /= len; }
    const sprinting = input.sprint && fwd > 0;
    const maxSpeed = MAX_SPEED * (sprinting ? SPRINT_MULT : 1);

    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);
    const wishX = (-sinY * fwd + cosY * strafe) * maxSpeed;
    const wishZ = (-cosY * fwd - sinY * strafe) * maxSpeed;

    const accelFactor = (fwd || strafe || (IS_MOBILE && input.joyActive) ? ACCEL : DECEL);
    const k = Math.min(1, accelFactor * delta * 0.55);
    vel.current.x += (wishX - vel.current.x) * k;
    vel.current.z += (wishZ - vel.current.z) * k;

    // ---- jump & gravity ----
    if (input.jump && onGround.current) {
      vel.current.y = JUMP_VELOCITY;
      onGround.current = false;
      useInput.setState({ jump: false });
      sound.hover();
    }
    vel.current.y -= GRAVITY * delta;
    if (pos.current.y <= 0 && vel.current.y <= 0) {
      pos.current.y = 0;
      vel.current.y = 0;
      onGround.current = true;
    }

    // ---- integrate + collide ----
    const prevX = pos.current.x;
    const prevZ = pos.current.z;
    pos.current.x += vel.current.x * delta;
    pos.current.z += vel.current.z * delta;
    const body = { x: pos.current.x, z: pos.current.z };
    let collided = false;
    for (let i = 0; i < 3; i++) {
      let hit = false;
      for (const r of COLLISION_MAP) {
        const cx = THREE.MathUtils.clamp(body.x, r[0], r[2]);
        const cz = THREE.MathUtils.clamp(body.z, r[1], r[3]);
        const dx = body.x - cx;
        const dz = body.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= PLAYER_RADIUS * PLAYER_RADIUS) continue;
        if (d2 > 1e-9) {
          const d = Math.sqrt(d2);
          const push = PLAYER_RADIUS - d;
          body.x += (dx / d) * push;
          body.z += (dz / d) * push;
        } else {
          const l = body.x - r[0];
          const rr = r[2] - body.x;
          const u = body.z - r[1];
          const dd = r[3] - body.z;
          const m = Math.min(l, rr, u, dd);
          if (m === l) body.x = r[0] - PLAYER_RADIUS;
          else if (m === rr) body.x = r[2] + PLAYER_RADIUS;
          else if (m === u) body.z = r[1] - PLAYER_RADIUS;
          else body.z = r[3] + PLAYER_RADIUS;
        }
        hit = true;
      }
      if (!hit) { collided = false; break; }
      collided = true;
    }
    pos.current.x = body.x;
    pos.current.z = body.z;
    if (collided) {
      if (Math.abs(pos.current.x - prevX) < Math.abs(vel.current.x * delta) * 0.5) vel.current.x = 0;
      if (Math.abs(pos.current.z - prevZ) < Math.abs(vel.current.z * delta) * 0.5) vel.current.z = 0;
    }

    // ---- persist position ----
    useGame.setState({
      playerPos: [pos.current.x, pos.current.y, pos.current.z],
      playerRot: yaw.current,
    });
    const zn = zoneAt(pos.current.x, pos.current.z);
    if (zn !== st.currentZone) useGame.setState({ currentZone: zn });

    // ---- interaction detection ----
    target.current = findTarget();
    const intId = target.current ? target.current.id : null;
    if (!st.locked && !st.portalOpen) {
      if (intId !== st.interactingId) {
        useGame
          .getState()
          .setInteraction(intId, target.current ? `${target.current.label} — ${target.current.sub}` : null);
      }
    } else if (st.interactingId) {
      useGame.getState().setInteraction(null);
    }

    // ---- E interaction ----
    if (input.interact && target.current) {
      const t = target.current;
      useInput.setState({ interact: false });
      if (t.terminal) {
        sound.whoosh();
        useGame.getState().openPortal(t.terminal as never);
      } else {
        sound.whoosh();
        useGame.getState().beginWorkout(t.id, t.xp, 1, t.label);
        window.setTimeout(() => {
          useGame.getState().completeWorkout(t.id, t.xp);
        }, 1700);
      }
    }

    // ---- camera data ----
    state.camera.userData.playerPos = pos.current.clone();
    state.camera.userData.yaw = yaw.current;
    state.camera.userData.pitch = pitch.current;
    state.camera.userData.eye = EYE_HEIGHT;
    state.camera.userData.velLen = Math.hypot(vel.current.x, vel.current.z);
  });

  // ---- keyboard listeners ----
  useEffect(() => {
    if (IS_MOBILE) return;
    const map = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", " "].includes(key)) e.preventDefault();
      const k: { fwd?: number; strafe?: number; sprint?: boolean; jump?: boolean } = {};
      if (key === "w") k.fwd = 1;
      if (key === "s") k.fwd = -1;
      if (key === "d") k.strafe = 1;
      if (key === "a") k.strafe = -1;
      if (key === "shift") k.sprint = true;
      if (key === " ") k.jump = true;
      if (key === "e") useInput.getState().press();
      useInput.getState().setKeys(k);
    };
    const unmap = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const k: { fwd?: number; strafe?: number; sprint?: boolean; jump?: boolean } = {};
      if (key === "w") k.fwd = 0;
      if (key === "s") k.fwd = 0;
      if (key === "d") k.strafe = 0;
      if (key === "a") k.strafe = 0;
      if (key === "shift") k.sprint = false;
      if (key === " ") k.jump = false;
      useInput.getState().setKeys(k);
    };
    window.addEventListener("keydown", map);
    window.addEventListener("keyup", unmap);
    return () => {
      window.removeEventListener("keydown", map);
      window.removeEventListener("keyup", unmap);
    };
  }, []);

  // ---- pointer lock (desktop) ----
  useEffect(() => {
    if (IS_MOBILE) return;
    const lock = () => {
      const st = useGame.getState();
      if (st.portalOpen || st.screen !== "gym" || st.locked) return;
      const target = document
        .querySelector(".no-pointer-lock")
        ?.contains?.(document.activeElement);
      if (target) return;
      document.body.requestPointerLock?.();
    };
    const onLockChange = () => {
      const locked = document.pointerLockElement == null;
      if (locked) useInput.getState().resetAll();
      useGame.getState().setLocked(locked);
    };
    const onMove = (e: MouseEvent) => {
      useInput.getState().applyLook(e.movementX, e.movementY);
    };
    document.addEventListener("mousedown", lock);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("pointerlockerror", () => {});
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousedown", lock);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("pointerlockerror", () => {});
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  return null;
}
