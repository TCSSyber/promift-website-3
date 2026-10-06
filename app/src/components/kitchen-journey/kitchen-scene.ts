/* ===========================================================================
 * Promift — the real-time kitchen.
 *
 * A procedurally built room and a single continuous camera curve. Nothing is
 * driven by time or by scroll speed: every animated value is a pure function of
 * one progress number `p` in [0, 1], which the component derives from the
 * document scroll position. That is what guarantees the same final frame at any
 * scroll speed, forward or backward.
 *
 * Client-only: imported dynamically from the journey component so SSR never
 * touches three.
 * ========================================================================= */

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const C = {
  plaster: 0xeee3d2,
  plaster2: 0xdccdb7,
  ink: 0x171c17,
  green: 0x7a4e30,
  green2: 0x8a5a38,
  oak: 0xc39a6b,
  oak2: 0xe2d3bb,
  stone: 0xffffff,
  stud: 0xa8814f,
  ply: 0xc09a6a,
};

type P3 = [number, number, number];

/** Camera keyframes: progress, position, look-at target. */
const CAM: { t: number; pos: P3; look: P3 }[] = [
  { t: 0.0, pos: [0, 1.58, 11.2], look: [0, 1.5, 8.0] },
  { t: 0.08, pos: [0, 1.57, 9.0], look: [0, 1.5, 8.0] },
  { t: 0.15, pos: [0, 1.56, 8.2], look: [0, 1.5, 6.4] },
  { t: 0.21, pos: [0, 1.54, 6.6], look: [0, 1.45, 4.0] },
  { t: 0.29, pos: [0, 1.52, 4.2], look: [0.2, 1.35, 1.2] },
  { t: 0.37, pos: [0.5, 1.5, 2.4], look: [1.0, 1.3, 0.0] },
  { t: 0.45, pos: [1.4, 1.46, 0.6], look: [0.5, 1.05, -1.4] },
  { t: 0.54, pos: [2.0, 1.5, -1.5], look: [0, 0.95, -1.3] },
  { t: 0.62, pos: [0.5, 1.5, -2.7], look: [0, 0.95, -1.3] },
  { t: 0.69, pos: [-0.9, 1.5, -2.5], look: [-1.9, 1.15, -3.4] },
  { t: 0.77, pos: [-1.2, 1.4, -2.9], look: [-2.6, 1.45, -3.4] },
  { t: 0.84, pos: [-0.7, 1.5, -2.9], look: [-0.7, 1.4, -4.8] },
  { t: 0.9, pos: [-0.7, 1.5, -5.1], look: [0.4, 1.1, -7.0] },
  { t: 0.95, pos: [-0.7, 1.52, -4.5], look: [-0.2, 1.2, -1.8] },
  { t: 1.0, pos: [1.9, 1.62, 1.5], look: [-0.3, 1.0, -1.8] },
];


// ---- procedural textures (client only; built once per scene) -------------

function rand(seed: number) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  repeatX = 1,
  repeatY = 1,
  srgb = true,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 8;
  return t;
}

function speckle(g: CanvasRenderingContext2D, w: number, h: number, n: number, alpha: number, seed: number) {
  const r = rand(seed);
  for (let i = 0; i < n; i++) {
    const v = Math.floor(r() * 255);
    g.fillStyle = `rgba(${v},${v},${v},${alpha * r()})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

/** Walnut: long, slightly wavy vertical grain, light so the colour tints it. */
function woodTexture() {
  return canvasTexture(512, 1024, (g, w, h) => {
    g.fillStyle = "#e9e1d8";
    g.fillRect(0, 0, w, h);
    const r = rand(11);
    for (let i = 0; i < 170; i++) {
      const x0 = r() * w;
      const amp = 4 + r() * 14;
      const freq = 0.004 + r() * 0.01;
      const shade = 90 + Math.floor(r() * 90);
      g.strokeStyle = `rgba(${shade - 30},${shade - 45},${shade - 55},${0.12 + r() * 0.3})`;
      g.lineWidth = 0.6 + r() * 2.6;
      g.beginPath();
      for (let y = 0; y <= h; y += 8) {
        const x = x0 + Math.sin(y * freq + i) * amp;
        if (y === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    speckle(g, w, h, 4000, 0.08, 5);
  });
}

/** Warm veined stone like the reference renders: cream base, brown/grey veins. */
function marbleTexture() {
  return canvasTexture(1024, 1024, (g, w, h) => {
    const base = g.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#efe3cf");
    base.addColorStop(0.5, "#e2cfb3");
    base.addColorStop(1, "#ecdcc4");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const r = rand(29);
    const cols = ["120,86,58", "92,74,62", "160,120,80", "70,58,50", "196,160,112"];
    for (let i = 0; i < 26; i++) {
      const col = cols[i % cols.length];
      let x = r() * w;
      let y = -50;
      const drift = (r() - 0.3) * 6;
      g.lineCap = "round";
      for (let pass = 0; pass < 3; pass++) {
        g.strokeStyle = `rgba(${col},${pass === 0 ? 0.08 : pass === 1 ? 0.18 : 0.55})`;
        g.lineWidth = pass === 0 ? 22 + r() * 30 : pass === 1 ? 6 + r() * 8 : 0.8 + r() * 2.2;
        g.beginPath();
        let px = x;
        let py = y;
        g.moveTo(px, py);
        const rr = rand(1000 + i);
        while (py < h + 50) {
          px += drift + (rr() - 0.5) * 26;
          py += 10 + rr() * 22;
          g.lineTo(px, py);
        }
        g.stroke();
      }
      x += 0;
    }
    speckle(g, w, h, 9000, 0.12, 3);
  });
}

/** Travertine floor tiles: soft pitted stone with thin joints. */
function travertineTexture(repeatX: number, repeatY: number) {
  return canvasTexture(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#efe6d8";
      g.fillRect(0, 0, w, h);
      const r = rand(7);
      for (let i = 0; i < 60; i++) {
        g.fillStyle = `rgba(150,128,100,${0.04 + r() * 0.06})`;
        g.fillRect(0, r() * h, w, 1 + r() * 5);
      }
      for (let i = 0; i < 260; i++) {
        g.fillStyle = `rgba(120,100,80,${0.1 + r() * 0.2})`;
        g.beginPath();
        g.ellipse(r() * w, r() * h, 1 + r() * 4, 0.6 + r() * 1.6, 0, 0, Math.PI * 2);
        g.fill();
      }
      speckle(g, w, h, 5000, 0.1, 9);
      g.strokeStyle = "rgba(110,92,72,0.55)";
      g.lineWidth = 3;
      g.strokeRect(0, 0, w, h);
    },
    repeatX,
    repeatY,
  );
}

/** Limewash plaster: soft clouded tone. */
function plasterTexture() {
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = "#f1ece4";
    g.fillRect(0, 0, w, h);
    const r = rand(17);
    for (let i = 0; i < 90; i++) {
      const rad = 30 + r() * 120;
      const x = r() * w;
      const y = r() * h;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      const v = r() > 0.5 ? "255,250,242" : "196,184,166";
      grd.addColorStop(0, `rgba(${v},0.14)`);
      grd.addColorStop(1, `rgba(${v},0)`);
      g.fillStyle = grd;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    speckle(g, w, h, 3000, 0.06, 4);
  }, 2, 2);
}

function smooth(a: number, b: number, x: number) {
  return THREE.MathUtils.smoothstep(x, a, b);
}

function mixColor(out: THREE.Color, a: number, b: number, t: number) {
  out.setHex(a).lerp(new THREE.Color().setHex(b), THREE.MathUtils.clamp(t, 0, 1));
  return out;
}

/** A quick canvas label sprite (millimetre text on the dimension lines). */
function labelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 80);
  ctx.fillStyle = "#be8c54";
  ctx.font = "600 40px Archivo, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 42);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  sprite.scale.set(0.9, 0.28, 1);
  return sprite;
}

export class KitchenScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  private mats: Record<string, THREE.MeshStandardMaterial> = {};
  private posCurve!: THREE.CatmullRomCurve3;
  private lookCurve!: THREE.CatmullRomCurve3;

  private studs!: THREE.Group;
  private floorRaw!: THREE.Mesh;
  private floorDone!: THREE.Mesh;
  private baseCabs!: THREE.Group;
  private upperCabs!: THREE.Group;
  private island!: THREE.Group;
  private islandCounter!: THREE.Mesh;
  private tallCab!: THREE.Group;
  private explodeLayers: THREE.Object3D[] = [];
  private islandDoors: { pivot: THREE.Object3D; shaker: THREE.Group; slab: THREE.Mesh }[] = [];
  private carcassMats: THREE.MeshStandardMaterial[] = [];
  private dims!: THREE.Group;
  private dimItems: { node: THREE.Object3D; sprite: THREE.Sprite | null }[] = [];
  private sun!: THREE.DirectionalLight;
  private hemi!: THREE.HemisphereLight;
  private lamp!: THREE.PointLight;
  private fill!: THREE.PointLight;
  private tmpColor = new THREE.Color();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1b140e);
    // Soft studio reflections so stone, bronze and lacquer read as real surfaces.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.05, 120);

    this.buildMaterials();
    this.buildLighting();
    this.buildCurves();
    this.buildWorld();
    this.resize(canvas.clientWidth || 1280, canvas.clientHeight || 720);
  }

  // ---- setup -------------------------------------------------------------

  private mat(hex: number, roughness: number, metalness = 0) {
    return new THREE.MeshStandardMaterial({ color: hex, roughness, metalness });
  }

  private buildMaterials() {
    const wood = woodTexture();
    const marble = marbleTexture();
    const floor = travertineTexture(4, 6);
    const plaster = plasterTexture();
    const tex = (hex: number, map: THREE.Texture | null, roughness: number, metalness = 0) =>
      new THREE.MeshStandardMaterial({ color: hex, map, roughness, metalness, envMapIntensity: 0.9 });
    this.mats = {
      plaster: tex(C.plaster, plaster, 0.92),
      plaster2: tex(C.plaster2, plaster, 0.9),
      ink: this.mat(C.ink, 0.6),
      green: tex(C.green, wood, 0.48),
      green2: tex(C.green2, wood, 0.45),
      oak: tex(C.oak, wood, 0.5),
      oak2: tex(C.oak2, floor, 0.38),
      stone: tex(C.stone, marble, 0.16),
      stud: tex(C.stud, wood, 0.95),
      ply: this.mat(C.ply, 0.9),
      black: this.mat(0x0d0f0c, 0.9),
    };
    this.mats.stone.envMapIntensity = 1.3;
    this.mats.plaster.side = THREE.DoubleSide;
    this.mats.plaster2.side = THREE.DoubleSide;
  }

  private buildLighting() {
    this.hemi = new THREE.HemisphereLight(0xfff0dc, 0x3a2a1c, 0.6);
    this.scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xffb45e, 2.4);
    this.sun.position.set(6, 7.5, 5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.radius = 5;
    this.sun.shadow.normalBias = 0.02;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 40;
    this.sun.shadow.camera.left = -12;
    this.sun.shadow.camera.right = 12;
    this.sun.shadow.camera.top = 12;
    this.sun.shadow.camera.bottom = -12;
    this.sun.shadow.bias = -0.0012;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.lamp = new THREE.PointLight(0xffd9a8, 6, 7, 2);
    this.lamp.position.set(0, 2.25, 8.15);
    this.scene.add(this.lamp);

    this.fill = new THREE.PointLight(0xffe8cf, 4, 9, 2);
    this.fill.position.set(0.4, 2.35, -0.4);
    this.scene.add(this.fill);
  }

  private buildCurves() {
    this.posCurve = new THREE.CatmullRomCurve3(
      CAM.map((k) => new THREE.Vector3(...k.pos)),
      false,
      "catmullrom",
      0.35,
    );
    this.lookCurve = new THREE.CatmullRomCurve3(
      CAM.map((k) => new THREE.Vector3(...k.look)),
      false,
      "catmullrom",
      0.35,
    );
  }

  private box(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    shadow = true,
  ) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  }

  // ---- world -------------------------------------------------------------

  private buildWorld() {
    const T = 0.12; // wall thickness
    const H = 2.7; // ceiling height

    // Room plan: kitchen x[-2.6,2.6] z[-4.2,3.2]; hallway x[-0.9,0.9]
    // z[3.2,8.0]; facade at z=8.0; millwork wing z[-9.6,-4.2].

    // ---- floors & ceilings
    this.floorDone = this.box(5.2, 0.06, 7.4, this.mats.oak2, 0, 0, -0.5, false);
    this.floorDone.receiveShadow = true;
    this.scene.add(this.floorDone);

    this.floorRaw = this.box(5.2, 0.05, 7.4, this.mats.ply, 0, 0.005, -0.5, false);
    this.scene.add(this.floorRaw);
    this.scene.add(this.box(5.2, 0.05, 7.4, this.mats.ply2 ?? this.mats.ply, 0, 0.005, -0.5, false));

    this.scene.add(this.box(1.8, 0.06, 4.8, this.mats.oak2, 0, 0, 5.6, false));
    this.scene.add(this.box(5.2, 0.1, H, this.mats.plaster2, 0, H + 0.05, -0.5, false));
    this.scene.add(this.box(1.8, 0.1, 4.8, this.mats.plaster2, 0, H + 0.05, 5.6, false));

    // ---- kitchen shell
    this.scene.add(this.box(T, H, 7.4, this.mats.plaster, -2.66, H / 2, -0.5)); // left
    this.scene.add(this.box(T, H, 7.4, this.mats.plaster, 2.66, H / 2, -0.5)); // right
    // back wall, with the millwork doorway
    this.scene.add(this.box(1.4, H, T, this.mats.plaster, -1.9, H / 2, -4.26));
    this.scene.add(this.box(2.8, H, T, this.mats.plaster, 1.2, H / 2, -4.26));
    this.scene.add(this.box(1.0, 0.6, T, this.mats.plaster, -0.7, 2.4, -4.26));
    // front wall, with the hallway doorway
    this.scene.add(this.box(2.1, H, T, this.mats.plaster, -1.55, H / 2, 3.26));
    this.scene.add(this.box(2.1, H, T, this.mats.plaster, 1.55, H / 2, 3.26));
    this.scene.add(this.box(1.0, 0.6, T, this.mats.plaster, 0, 2.4, 3.26));

    // ---- hallway shell
    this.scene.add(this.box(T, H, 4.8, this.mats.plaster, -0.96, H / 2, 5.6));
    this.scene.add(this.box(T, H, 4.8, this.mats.plaster, 0.96, H / 2, 5.6));

    // ---- facade at dusk, with the front door
    this.scene.add(this.box(3.0, H + 1.4, T, this.mats.plaster2, -2.0, (H + 1.4) / 2, 8.06));
    this.scene.add(this.box(3.0, H + 1.4, T, this.mats.plaster2, 2.0, (H + 1.4) / 2, 8.06));
    this.scene.add(this.box(1.0, 0.9, T, this.mats.plaster2, 0, 2.85, 8.06));

    const door = this.box(1.0, 2.16, 0.06, this.mats.ink, 0.5, 1.08, 7.96);
    const doorPivot = new THREE.Object3D();
    doorPivot.position.set(-0.5, 1.08, 7.96);
    door.position.set(0.5, 0, 0);
    doorPivot.rotation.y = -1.15; // stands open at dusk
    doorPivot.add(door);
    this.scene.add(doorPivot);

    // porch
    this.scene.add(this.box(7.2, 0.04, 4.4, this.mats.black, 0, -0.03, 10.2, false));
    this.scene.add(this.box(1.0, 0.06, 1.6, this.mats.plaster2, 0, 0.01, 8.9, false));
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xffe0b0, emissive: 0xffb45e, emissiveIntensity: 2.2 }),
    );
    bulb.position.set(0, 2.34, 8.16);
    this.scene.add(bulb);
    this.scene.add(this.box(0.5, 0.9, 0.5, this.mats.plaster2, -3.2, 0.45, 9.2));
    this.scene.add(this.box(0.5, 0.9, 0.5, this.mats.plaster2, 3.2, 0.45, 9.2));

    // ---- unfinished state: studs + subfloor edges
    this.studs = new THREE.Group();
    for (let i = 0; i <= 12; i++) {
      const x = -2.5 + i * 0.42;
      this.studs.add(this.box(0.09, 2.5, 0.09, this.mats.stud, x, 1.25, -4.16));
    }
    for (let i = 0; i <= 17; i++) {
      const z = -4.1 + i * 0.42;
      this.studs.add(this.box(0.09, 2.5, 0.09, this.mats.stud, -2.56, 1.25, z));
    }
    this.studs.add(this.box(5.2, 0.1, 0.1, this.mats.stud, 0, 2.5, -4.16));
    this.scene.add(this.studs);

    // ---- base cabinet run along the right wall
    this.baseCabs = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const z = -2.85 + i * 0.62;
      const carcass = this.box(0.56, 0.86, 0.6, this.mats.green, 2.28, 0.43, z);
      this.baseCabs.add(carcass);
      this.carcassMats.push(this.mats.green);
      this.baseCabs.add(this.doorUnit(2.0, 0.43, z, 0.86, 0.58));
    }
    this.baseCabs.add(this.box(0.62, 0.05, 3.9, this.mats.stone, 2.26, 0.89, -1.3, false));
    this.scene.add(this.baseCabs);

    // ---- upper cabinets
    this.upperCabs = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const z = -2.2 + i * 0.66;
      this.upperCabs.add(this.box(0.36, 0.72, 0.64, this.mats.green, 2.4, 1.94, z));
      this.upperCabs.add(this.box(0.03, 0.66, 0.58, this.mats.green2, 2.2, 1.94, z, false));
    }
    // warm LED strip under the upper run, like the reference kitchens
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.012, 1.95),
      new THREE.MeshStandardMaterial({ color: 0xffe2b8, emissive: 0xffb866, emissiveIntensity: 3 }),
    );
    led.position.set(2.32, 1.575, -1.54);
    this.upperCabs.add(led);
    const glow = new THREE.PointLight(0xffb866, 2.2, 2.4, 2);
    glow.position.set(2.2, 1.45, -1.54);
    this.upperCabs.add(glow);
    this.scene.add(this.upperCabs);

    // ---- island
    this.island = new THREE.Group();
    this.island.add(this.box(1.9, 0.86, 0.92, this.mats.green, 0, 0.43, 0));
    for (let i = 0; i < 3; i++) {
      const x = -0.62 + i * 0.62;
      this.island.add(this.doorUnitX(x, 0.43, 0.47, 0.86, 0.58));
    }
    this.islandCounter = this.box(2.5, 0.06, 1.18, this.mats.stone, 0, 0.89, 0, false);
    this.island.add(this.islandCounter);
    this.island.position.set(0, 0, -1.3);
    this.scene.add(this.island);

    // ---- the tall cabinet that opens into its materials
    this.tallCab = new THREE.Group();
    const tallX = -2.28;
    const tallZ = -3.4;
    const carcass = this.box(0.6, 2.1, 0.6, this.mats.green, tallX, 1.05, tallZ);
    const doorFace = this.box(0.05, 2.06, 0.56, this.mats.oak, tallX, 1.05, tallZ);
    const mdfCore = this.box(0.04, 2.0, 0.52, this.mats.plaster2, tallX, 1.05, tallZ);
    this.tallCab.add(carcass, mdfCore, doorFace);
    this.explodeLayers = [doorFace, mdfCore, carcass];
    this.scene.add(this.tallCab);

    // ---- dimension lines (oak, drawn in the air)
    this.dims = new THREE.Group();
    const dim = (len: number, x: number, y: number, z: number, axis: "x" | "z", text: string) => {
      const node = this.box(
        axis === "x" ? len : 0.012,
        0.012,
        axis === "z" ? len : 0.012,
        this.mats.oak,
        x,
        y,
        z,
        false,
      );
      const tickA = this.box(0.012, 0.14, 0.012, this.mats.oak, 0, 0, 0, false);
      const tickB = tickA.clone();
      if (axis === "x") {
        tickA.position.set(-len / 2, 0, 0);
        tickB.position.set(len / 2, 0, 0);
      } else {
        tickA.position.set(0, 0, -len / 2);
        tickB.position.set(0, 0, len / 2);
      }
      node.add(tickA, tickB);
      const sprite = labelSprite(text);
      sprite.position.set(0, 0.22, 0);
      node.add(sprite);
      this.dims.add(node);
      this.dimItems.push({ node, sprite });
    };
    dim(3.6, 0.6, 1.5, -3.9, "x", "3600 mm");
    dim(2.2, 0, 1.35, -0.55, "x", "2200 mm");
    dim(0.9, -2.6, 1.15, -2.2, "z", "900 mm");
    dim(2.1, -2.6, 2.35, -3.4, "z", "2100 mm");
    this.scene.add(this.dims);

    // ---- millwork wing: walk-in closet + bathroom vanity
    const wing = new THREE.Group();
    wing.add(this.box(5.2, 0.06, 5.4, this.mats.oak2, 0, 0, -6.9, false));
    wing.add(this.box(5.2, 0.1, H, this.mats.plaster2, 0, H + 0.05, -6.9, false));
    wing.add(this.box(T, H, 5.4, this.mats.plaster, -2.66, H / 2, -6.9));
    wing.add(this.box(T, H, 5.4, this.mats.plaster, 2.66, H / 2, -6.9));
    wing.add(this.box(5.2, H, T, this.mats.plaster, 0, H / 2, -9.66));
    // closet: oak wardrobe run along the right wall
    wing.add(this.box(0.62, 2.4, 2.6, this.mats.oak, 2.3, 1.2, -6.6));
    wing.add(this.box(0.04, 2.34, 0.06, this.mats.ink, 2.0, 1.2, -6.6, false));
    for (let i = 0; i < 3; i++) {
      wing.add(this.box(0.02, 0.02, 2.5, this.mats.oak2, 1.99, 0.6 + i * 0.6, -6.6, false));
    }
    // vanity along the left wall
    wing.add(this.box(0.55, 0.8, 1.3, this.mats.green, -2.32, 0.4, -7.2));
    wing.add(this.box(0.6, 0.05, 1.4, this.mats.stone, -2.3, 0.83, -7.2, false));
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.14, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0xf3f0e9, roughness: 0.2 }),
    );
    basin.position.set(-2.3, 0.9, -7.2);
    wing.add(basin);
    wing.add(this.box(0.05, 0.9, 1.0, this.mats.plaster2, -2.6, 1.7, -7.2, false));
    this.scene.add(wing);
  }

  /** A hinged cabinet door on the right-wall run (faces -x). */
  private doorUnit(x: number, y: number, z: number, h: number, w: number) {
    const pivot = new THREE.Object3D();
    pivot.position.set(x - 0.29, y, z - w / 2);
    const slab = this.box(0.03, h - 0.04, w - 0.03, this.mats.green2, -0.01, 0, w / 2);
    const shaker = new THREE.Group();
    const bar = 0.05;
    shaker.add(this.box(0.035, bar, w - 0.06, this.mats.green2, -0.02, (h - 0.04) / 2 - bar / 2, w / 2));
    shaker.add(this.box(0.035, bar, w - 0.06, this.mats.green2, -0.02, -(h - 0.04) / 2 + bar / 2, w / 2));
    shaker.add(this.box(0.035, h - 0.04, bar, this.mats.green2, -0.02, 0, 0.06));
    shaker.add(this.box(0.035, h - 0.04, bar, this.mats.green2, -0.02, 0, w - 0.06));
    shaker.visible = false;
    pivot.add(slab, shaker);
    this.islandDoors.push({ pivot, shaker, slab });
    return pivot;
  }

  /** An island front (faces -z). */
  private doorUnitX(x: number, y: number, z: number, h: number, w: number) {
    const pivot = new THREE.Object3D();
    pivot.position.set(x - w / 2, y, z - 0.47);
    const slab = this.box(w - 0.03, h - 0.04, 0.03, this.mats.green2, w / 2, 0, -0.01);
    const shaker = new THREE.Group();
    const bar = 0.05;
    shaker.add(this.box(w - 0.06, bar, 0.035, this.mats.green2, w / 2, (h - 0.04) / 2 - bar / 2, -0.02));
    shaker.add(this.box(w - 0.06, bar, 0.035, this.mats.green2, w / 2, -(h - 0.04) / 2 + bar / 2, -0.02));
    shaker.add(this.box(bar, h - 0.04, 0.035, this.mats.green2, 0.06, 0, -0.02));
    shaker.add(this.box(bar, h - 0.04, 0.035, this.mats.green2, w - 0.06, 0, -0.02));
    shaker.visible = false;
    pivot.add(slab, shaker);
    this.islandDoors.push({ pivot, shaker, slab });
    return pivot;
  }

  // ---- the single progress -> world function -----------------------------

  applyProgress(pRaw: number) {
    const p = THREE.MathUtils.clamp(pRaw, 0, 1);
    const s = THREE.MathUtils.smoothstep;

    // camera: map p onto the keyframe timeline, then sample the smooth curves
    let i = 0;
    while (i < CAM.length - 2 && p > CAM[i + 1].t) i++;
    const t0 = CAM[i].t;
    const t1 = CAM[i + 1].t;
    const localRaw = (p - t0) / Math.max(t1 - t0, 1e-4);
    const local = s(localRaw, 0, 1);
    const u = (i + local) / (CAM.length - 1);
    this.camera.position.copy(this.posCurve.getPoint(u));
    const look = this.lookCurve.getPoint(u);
    this.camera.lookAt(look);

    // light: dusk outside -> warm interior -> golden hour at the close
    const duskToInterior = s(0.06, 0.24, p);
    const toGolden = s(0.82, 0.97, p);
    const sunColor = mixColor(this.tmpColor, 0xff9d5a, 0xffe2bd, duskToInterior);
    sunColor.copy(mixColor(this.tmpColor, sunColor.getHex(), 0xffb45e, toGolden));
    this.sun.color.copy(sunColor);
    this.sun.intensity = 0.35 + duskToInterior * 0.75 + toGolden * 0.55;
    this.sun.position.set(
      6 - toGolden * 1.5,
      7.5 - toGolden * 5.4 + duskToInterior * 1.4,
      5 - duskToInterior * 1.2 + toGolden * 2.6,
    );
    this.hemi.intensity = 0.28 + duskToInterior * 0.5 + toGolden * 0.16;
    this.lamp.intensity = 6 * (1 - duskToInterior * 0.72);
    this.fill.intensity = 4 * duskToInterior;
    (this.scene.background as THREE.Color).setHex(
      p < 0.14 ? 0x14120f : 0x1b2018,
    );

    // the room builds itself
    const studsOut = s(0.30, 0.36, p);
    this.studs.visible = studsOut < 0.999;
    this.studs.scale.y = 1 - studsOut * 0.7;
    this.floorRaw.visible = p < 0.34;
    this.floorDone.visible = p >= 0.3;

    const rise = s(0.30, 0.42, p);
    this.baseCabs.visible = rise > 0.001;
    this.baseCabs.position.y = -(1 - rise) * 1.5;
    const upperRise = s(0.35, 0.46, p);
    this.upperCabs.visible = upperRise > 0.001;
    this.upperCabs.position.y = (1 - upperRise) * 1.4;

    const slide = s(0.42, 0.5, p);
    this.island.visible = slide > 0.001;
    this.island.position.x = (1 - slide) * -6.2;
    this.island.position.z = -1.3 + (1 - slide) * 1.2;

    const drop = s(0.47, 0.53, p);
    this.islandCounter.position.y = 0.89 + (1 - drop) * 1.7;
    (this.baseCabs.children[this.baseCabs.children.length - 1] as THREE.Mesh).position.y =
      0.89 + (1 - s(0.5, 0.56, p)) * 1.5;

    const close = s(0.48, 0.58, p);
    for (const d of this.islandDoors) d.pivot.rotation.y = (1 - close) * -1.35;

    // fronts morph: Shaker -> slab -> two tone -> warm wood, while orbiting
    const morph = s(0.53, 0.66, p) * (p < 0.7 ? 1 : 1);
    const variant = Math.min(3, Math.floor(morph * 4.0001));
    const doorColor = [C.green2, C.green2, C.oak, C.oak2][variant];
    const carcassColor = [C.green, C.green, C.green, C.oak][variant];
    for (const d of this.islandDoors) {
      d.shaker.visible = variant === 0;
      (d.slab.material as THREE.MeshStandardMaterial).color.setHex(doorColor);
      d.shaker.traverse((o) => {
        if ((o as THREE.Mesh).isMesh)
          ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).color.setHex(doorColor);
      });
    }
    this.island.children.forEach((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh && m.geometry instanceof THREE.BoxGeometry && m !== this.islandCounter) {
        (m.material as THREE.MeshStandardMaterial).color.setHex(carcassColor);
      }
    });

    // one tall cabinet opens into its three layers
    const ex = s(0.68, 0.79, p);
    const offs = [-0.34, 0, 0.34];
    this.explodeLayers.forEach((layer, idx) => {
      layer.position.z = -3.4 + (1 - idx) * 0.0 + ex * (idx === 0 ? 0.55 : idx === 1 ? 0.1 : -0.55);
      layer.position.x = -2.28 - ex * (idx === 0 ? 0.5 : 0);
    });

    // dimension lines draw in the air
    const draw = s(0.46, 0.6, p);
    this.dims.visible = draw > 0.002;
    this.dimItems.forEach((item, idx) => {
      const stagger = THREE.MathUtils.clamp(draw * 1.4 - idx * 0.18, 0, 1);
      item.node.visible = stagger > 0.02;
      item.node.scale.set(
        Math.max(stagger, 0.001),
        1,
        Math.max(stagger, 0.001),
      );
      if (item.sprite) item.sprite.material.opacity = stagger;
    });
  }

  // ---- frame -------------------------------------------------------------

  resize(width: number, height: number) {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
  }

  render() {
    this.sun.target.position.set(0, 1, -1);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
      const sprite = obj as THREE.Sprite;
      if (sprite.isSprite) sprite.material.map?.dispose();
    });
    this.renderer.dispose();
  }
}

/** Quick WebGL capability probe used before constructing the scene. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}
