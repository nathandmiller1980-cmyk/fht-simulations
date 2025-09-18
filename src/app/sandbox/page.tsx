"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type LocaleKey = keyof typeof TRANSLATIONS;
type TranslationKey = keyof (typeof TRANSLATIONS)[LocaleKey];
type ElementKey = keyof typeof ELEMENTS;
type BondKey = keyof typeof BOND_TYPES;

interface Atom {
  id: string;
  element: ElementKey;
  position: [number, number, number];
  velocity: [number, number, number];
  charge: number;
}

interface Bond {
  id: string;
  atom1: string;
  atom2: string;
  type: BondKey;
  strength: number;
  length: number;
}

interface SimulationParams {
  temperature: number;
  pressure: number;
  pH: number;
  timeScale: number;
}

const TRANSLATIONS = {
  "en-US": {
    appTitle: "Molecular Sandbox",
    subtitle: "Interactive Chemistry Laboratory",
    elementsTab: "Elements",
    reactionsTab: "Reactions",
    forcesTab: "Forces",
    simulationTab: "Simulation",
    clearWorkspace: "Clear All",
    pauseSimulation: "Pause",
    playSimulation: "Play",
    resetSimulation: "Reset",
    temperatureLabel: "Temperature (K):",
    pressureLabel: "Pressure (atm):",
    pHLabel: "pH:",
    timeLabel: "Time Scale:",
    energyLabel: "System Energy:",
    addAtom: "Add Atom",
    bondAtoms: "Bond Atoms",
    selectMode: "Select",
    moveMode: "Move",
    deleteMode: "Delete",
    selectedAtoms: "Selected:",
    bondType: "Bond Type:",
    single: "Single",
    double: "Double",
    triple: "Triple",
    ionic: "Ionic",
    metallic: "Metallic",
    vanDerWaals: "van der Waals",
    hydrogenBond: "Hydrogen",
    reactionTypes: "Reaction Types:",
    synthesis: "Synthesis",
    decomposition: "Decomposition",
    singleReplacement: "Single Replacement",
    doubleReplacement: "Double Replacement",
    combustion: "Combustion",
    acidBase: "Acid-Base",
    oxidationReduction: "Redox",
    catalytic: "Catalytic",
    forces: "Intermolecular Forces:",
    strongNuclear: "Strong Nuclear",
    weakNuclear: "Weak Nuclear",
    electromagnetic: "Electromagnetic",
    gravitational: "Gravitational",
    covalent: "Covalent",
    london: "London Dispersion",
    dipole: "Dipole-Dipole",
    controlsTitle: "Controls:",
    dragToRotate: "• Drag to rotate view",
    scrollToZoom: "• Scroll to zoom",
    clickToSelect: "• Click atoms to select",
    rightClickMenu: "• Right-click for menu",
    molecularFormula: "Molecular Formula:",
    totalAtoms: "Total Atoms:",
    totalBonds: "Total Bonds:",
    systemEnergy: "System Energy:",
    kineticEnergy: "Kinetic:",
    potentialEnergy: "Potential:",
    thermalEnergy: "Thermal:"
  }
} as const;

const ELEMENTS = {
  H: { name: "Hydrogen", color: 0xffffff, radius: 0.31, mass: 1.008, electronegativity: 2.2, valence: 1 },
  He: { name: "Helium", color: 0xd9ffff, radius: 0.28, mass: 4.003, electronegativity: 0, valence: 0 },
  Li: { name: "Lithium", color: 0xcc80ff, radius: 1.28, mass: 6.94, electronegativity: 0.98, valence: 1 },
  Be: { name: "Beryllium", color: 0xc2ff00, radius: 0.96, mass: 9.012, electronegativity: 1.57, valence: 2 },
  B: { name: "Boron", color: 0xffb5b5, radius: 0.84, mass: 10.81, electronegativity: 2.04, valence: 3 },
  C: { name: "Carbon", color: 0x909090, radius: 0.76, mass: 12.01, electronegativity: 2.55, valence: 4 },
  N: { name: "Nitrogen", color: 0x3050f8, radius: 0.71, mass: 14.01, electronegativity: 3.04, valence: 3 },
  O: { name: "Oxygen", color: 0xff0d0d, radius: 0.66, mass: 16, electronegativity: 3.44, valence: 2 },
  F: { name: "Fluorine", color: 0x90e050, radius: 0.57, mass: 19, electronegativity: 3.98, valence: 1 },
  Ne: { name: "Neon", color: 0xb3e3f5, radius: 0.58, mass: 20.18, electronegativity: 0, valence: 0 },
  Na: { name: "Sodium", color: 0xab5cf2, radius: 1.66, mass: 22.99, electronegativity: 0.93, valence: 1 },
  Mg: { name: "Magnesium", color: 0x8aff00, radius: 1.41, mass: 24.31, electronegativity: 1.31, valence: 2 },
  Al: { name: "Aluminum", color: 0xbfa6a6, radius: 1.21, mass: 26.98, electronegativity: 1.61, valence: 3 },
  Si: { name: "Silicon", color: 0xf0c8a0, radius: 1.11, mass: 28.09, electronegativity: 1.9, valence: 4 },
  P: { name: "Phosphorus", color: 0xff8000, radius: 1.07, mass: 30.97, electronegativity: 2.19, valence: 5 },
  S: { name: "Sulfur", color: 0xffff30, radius: 1.05, mass: 32.07, electronegativity: 2.58, valence: 6 },
  Cl: { name: "Chlorine", color: 0x1ff01f, radius: 1.02, mass: 35.45, electronegativity: 3.16, valence: 7 },
  Ar: { name: "Argon", color: 0x80d1e3, radius: 1.06, mass: 39.95, electronegativity: 0, valence: 0 },
  K: { name: "Potassium", color: 0x8f40d4, radius: 2.03, mass: 39.1, electronegativity: 0.82, valence: 1 },
  Ca: { name: "Calcium", color: 0x3dff00, radius: 1.76, mass: 40.08, electronegativity: 1, valence: 2 },
  Fe: { name: "Iron", color: 0xe06633, radius: 1.26, mass: 55.85, electronegativity: 1.83, valence: 3 },
  Cu: { name: "Copper", color: 0xc88033, radius: 1.28, mass: 63.55, electronegativity: 1.9, valence: 2 },
  Zn: { name: "Zinc", color: 0x7d80b0, radius: 1.34, mass: 65.38, electronegativity: 1.65, valence: 2 },
  Br: { name: "Bromine", color: 0xa62929, radius: 1.2, mass: 79.9, electronegativity: 2.96, valence: 7 },
  I: { name: "Iodine", color: 0x940094, radius: 1.39, mass: 126.9, electronegativity: 2.66, valence: 7 }
} as const;

const BOND_TYPES = {
  single: { strength: 1, length: 1.5, color: 0x666666, radius: 0.05 },
  double: { strength: 2, length: 1.3, color: 0x666666, radius: 0.04 },
  triple: { strength: 3, length: 1.2, color: 0x666666, radius: 0.04 },
  ionic: { strength: 0.8, length: 2, color: 0x00ffff, radius: 0.03 },
  metallic: { strength: 1.5, length: 2.5, color: 0xffd700, radius: 0.06 },
  vanDerWaals: { strength: 0.1, length: 3.5, color: 0x00ff00, radius: 0.02 },
  hydrogenBond: { strength: 0.2, length: 2.8, color: 0xff69b4, radius: 0.02 }
} as const;

const REACTION_TYPES = {
  synthesis: { color: 0x00ff00, description: "A + B → AB" },
  decomposition: { color: 0xff0000, description: "AB → A + B" },
  singleReplacement: { color: 0x0000ff, description: "A + BC → AC + B" },
  doubleReplacement: { color: 0xffff00, description: "AB + CD → AD + CB" },
  combustion: { color: 0xff4500, description: "Fuel + O₂ → CO₂ + H₂O" },
  acidBase: { color: 0x9932cc, description: "Acid + Base → Salt + Water" },
  oxidationReduction: { color: 0xff1493, description: "Electron Transfer" },
  catalytic: { color: 0x32cd32, description: "Catalyst Assisted" }
} as const;

const FORCES = [
  "strongNuclear",
  "weakNuclear",
  "electromagnetic",
  "gravitational",
  "covalent",
  "london",
  "hydrogenBond",
  "dipole"
] as const;

const t = (key: TranslationKey) => TRANSLATIONS["en-US"][key] ?? key;

export default function MolecularSandboxPage() {
  const [activeTab, setActiveTab] = useState("elements");
  const [selectedElement, setSelectedElement] = useState<ElementKey>("C");
  const [selectedBondType, setSelectedBondType] = useState<BondKey>("single");
  const [selectedReaction, setSelectedReaction] = useState<keyof typeof REACTION_TYPES>("synthesis");
  const [selectedForce, setSelectedForce] = useState<(typeof FORCES)[number] | null>(null);
  const [mode, setMode] = useState<"select" | "add" | "delete">("select");
  const [selectedAtoms, setSelectedAtoms] = useState<Set<string>>(() => new Set());
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    temperature: 298,
    pressure: 1,
    pH: 7,
    timeScale: 1
  });
  const [systemEnergy, setSystemEnergy] = useState({ kinetic: 0, potential: 0, thermal: 0, total: 0 });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number>();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const atomIdCounter = useRef(0);
  const bondIdCounter = useRef(0);
  const lastTimeRef = useRef<number>(Date.now());
  const atomsRef = useRef<Atom[]>(atoms);
  const bondsRef = useRef<Bond[]>(bonds);
  const simulationParamsRef = useRef<SimulationParams>(simulationParams);
  const isSimulatingRef = useRef(isSimulating);
  const modeRef = useRef(mode);
  const selectedElementRef = useRef<ElementKey>(selectedElement);

  const updateAtomSelection = useCallback((atomId: string, isSelected: boolean) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const atomMesh = scene.children.find(
      (child) => child.userData?.isAtom && child.userData.atomId === atomId
    ) as THREE.Mesh | undefined;

    if (!atomMesh) return;

    if (isSelected) {
      const glowGeometry = new THREE.SphereGeometry(
        (atomMesh.geometry as THREE.SphereGeometry).parameters.radius * 1.3,
        16,
        16
      );
      const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.3 });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(atomMesh.position);
      glowMesh.userData = { isGlow: true, parentAtomId: atomId };
      scene.add(glowMesh);
    } else {
      const glowMesh = scene.children.find(
        (child) => child.userData?.isGlow && child.userData.parentAtomId === atomId
      ) as THREE.Mesh | undefined;
      if (glowMesh) {
        scene.remove(glowMesh);
        glowMesh.geometry.dispose();
        (glowMesh.material as THREE.Material).dispose();
      }
    }
  }, []);

  const renderAtom = useCallback((atom: Atom) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const element = ELEMENTS[atom.element];
    const geometry = new THREE.SphereGeometry(element.radius * 0.5, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: element.color, transparent: true, opacity: 0.9 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...atom.position);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.userData = { isAtom: true, atomId: atom.id, element: atom.element };
    scene.add(sphere);
  }, []);

  const renderBond = useCallback((bond: Bond, atom1: Atom, atom2: Atom) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const bondInfo = BOND_TYPES[bond.type];
    const start = new THREE.Vector3(...atom1.position);
    const end = new THREE.Vector3(...atom2.position);
    const direction = new THREE.Vector3().subVectors(end, start);
    const distance = direction.length();

    const existingMeshes = scene.children.filter((child) => child.userData?.isBond && child.userData.bondId === bond.id);
    existingMeshes.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });

    const isWeakBond = bond.type === "vanDerWaals" || bond.type === "hydrogenBond";

    const addCylinder = (offsetVector?: THREE.Vector3) => {
      const geometry = new THREE.CylinderGeometry(bondInfo.radius, bondInfo.radius, distance, 8);
      const material = new THREE.MeshLambertMaterial({
        color: bondInfo.color,
        transparent: isWeakBond,
        opacity: isWeakBond ? 0.5 : 1
      });
      const cylinder = new THREE.Mesh(geometry, material);
      const midpoint = new THREE.Vector3().copy(start).add(end).multiplyScalar(0.5);
      if (offsetVector) {
        midpoint.add(offsetVector);
      }
      cylinder.position.copy(midpoint);
      cylinder.lookAt(end);
      cylinder.rotateX(Math.PI / 2);
      cylinder.userData = { isBond: true, bondId: bond.id, bondType: bond.type };
      scene.add(cylinder);
    };

    if (bond.type === "double" || bond.type === "triple") {
      const perpendicular = (() => {
        if (Math.abs(direction.y) < 0.9) {
          return new THREE.Vector3(0, 1, 0).cross(direction).normalize();
        }
        return new THREE.Vector3(1, 0, 0).cross(direction).normalize();
      })();
      const offset = bond.type === "double" ? 0.08 : 0.06;
      addCylinder();
      addCylinder(perpendicular.clone().multiplyScalar(offset));
      addCylinder(perpendicular.clone().multiplyScalar(-offset));
    } else {
      addCylinder();
    }
  }, []);

  const renderAllBonds = useCallback(
    (atomsList?: Atom[], bondsList?: Bond[]) => {
      const scene = sceneRef.current;
      if (!scene) return;

      const activeAtoms = atomsList ?? atomsRef.current;
      const activeBonds = bondsList ?? bondsRef.current;

      const bondMeshes = scene.children.filter((child) => child.userData?.isBond);
      bondMeshes.forEach((mesh) => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });

      activeBonds.forEach((bond) => {
        const atom1 = activeAtoms.find((a) => a.id === bond.atom1);
        const atom2 = activeAtoms.find((a) => a.id === bond.atom2);
        if (atom1 && atom2) {
          renderBond(bond, atom1, atom2);
        }
      });
    },
    [renderBond]
  );

  const calculateSystemEnergy = useCallback(
    (atomsList?: Atom[], bondsList?: Bond[]) => {
      const activeAtoms = atomsList ?? atomsRef.current;
      const activeBonds = bondsList ?? bondsRef.current;
      let kinetic = 0;
      let potential = 0;
      const thermal = simulationParamsRef.current.temperature * 8.314e-3;

      activeAtoms.forEach((atom) => {
        const element = ELEMENTS[atom.element];
        const velocityMagnitude = Math.hypot(...atom.velocity);
        kinetic += 0.5 * element.mass * velocityMagnitude ** 2;
      });

      activeBonds.forEach((bond) => {
        const atom1 = activeAtoms.find((a) => a.id === bond.atom1);
        const atom2 = activeAtoms.find((a) => a.id === bond.atom2);
        if (!atom1 || !atom2) return;
        const distance = Math.hypot(
          atom1.position[0] - atom2.position[0],
          atom1.position[1] - atom2.position[1],
          atom1.position[2] - atom2.position[2]
        );
        const deviation = Math.abs(distance - BOND_TYPES[bond.type].length);
        potential += BOND_TYPES[bond.type].strength * deviation ** 2;
      });

      const total = kinetic + potential + thermal;
      setSystemEnergy({ kinetic, potential, thermal, total });
      return total;
    },
    []
  );

  const removeAtom = useCallback(
    (atomId: string) => {
      const scene = sceneRef.current;
      if (!scene) return;

      setAtoms((prevAtoms) => {
        const newAtoms = prevAtoms.filter((atom) => atom.id !== atomId);
        atomsRef.current = newAtoms;

        setBonds((prevBonds) => {
          const newBonds = prevBonds.filter((bond) => bond.atom1 !== atomId && bond.atom2 !== atomId);
          bondsRef.current = newBonds;
          renderAllBonds(newAtoms, newBonds);
          calculateSystemEnergy(newAtoms, newBonds);
          return newBonds;
        });

        setSelectedAtoms((prev) => {
          const next = new Set(prev);
          if (next.delete(atomId)) {
            updateAtomSelection(atomId, false);
          }
          return next;
        });

        const atomMesh = scene.children.find(
          (child) => child.userData?.isAtom && child.userData.atomId === atomId
        ) as THREE.Mesh | undefined;
        if (atomMesh) {
          scene.remove(atomMesh);
          atomMesh.geometry.dispose();
          (atomMesh.material as THREE.Material).dispose();
        }

        const glowMesh = scene.children.find(
          (child) => child.userData?.isGlow && child.userData.parentAtomId === atomId
        ) as THREE.Mesh | undefined;
        if (glowMesh) {
          scene.remove(glowMesh);
          glowMesh.geometry.dispose();
          (glowMesh.material as THREE.Material).dispose();
        }

        return newAtoms;
      });
    },
    [calculateSystemEnergy, renderAllBonds, updateAtomSelection]
  );

  const addAtomAt3DPosition = useCallback(() => {
    const raycaster = raycasterRef.current;
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.at(10, intersectPoint);

    const element = selectedElementRef.current;
    const newAtom: Atom = {
      id: `${element}-${atomIdCounter.current++}`,
      element,
      position: [intersectPoint.x, intersectPoint.y, intersectPoint.z],
      velocity: [0, 0, 0],
      charge: 0
    };

    setAtoms((prev) => {
      const updated = [...prev, newAtom];
      atomsRef.current = updated;
      calculateSystemEnergy(updated, bondsRef.current);
      return updated;
    });
    renderAtom(newAtom);
  }, [calculateSystemEnergy, renderAtom]);

  const selectAtomAtPosition = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const raycaster = raycasterRef.current;
    const atomMeshes = scene.children.filter((child) => child.userData?.isAtom);
    const intersects = raycaster.intersectObjects(atomMeshes, false);
    if (!intersects.length) return;
    const atomId = intersects[0].object.userData.atomId as string;
    setSelectedAtoms((prev) => {
      const next = new Set(prev);
      const isSelected = next.has(atomId);
      if (isSelected) {
        next.delete(atomId);
      } else {
        next.add(atomId);
      }
      updateAtomSelection(atomId, !isSelected);
      return next;
    });
  }, [updateAtomSelection]);

  const deleteAtomAtPosition = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const raycaster = raycasterRef.current;
    const atomMeshes = scene.children.filter((child) => child.userData?.isAtom);
    const intersects = raycaster.intersectObjects(atomMeshes, false);
    if (!intersects.length) return;
    const atomId = intersects[0].object.userData.atomId as string;
    removeAtom(atomId);
  }, [removeAtom]);

  const handleMouseClick = useCallback(
    (event: MouseEvent) => {
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      if (!renderer || !camera) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      switch (modeRef.current) {
        case "add":
          addAtomAt3DPosition();
          break;
        case "select":
          selectAtomAtPosition();
          break;
        case "delete":
          deleteAtomAtPosition();
          break;
        default:
          break;
      }
    },
    [addAtomAt3DPosition, deleteAtomAtPosition, selectAtomAtPosition]
  );

  const updateSimulation = useCallback(
    (deltaTime: number) => {
      const timeStep = deltaTime * simulationParamsRef.current.timeScale;
      const nextAtoms = atomsRef.current.map((atom) => {
        const newPosition: [number, number, number] = [
          atom.position[0] + atom.velocity[0] * timeStep,
          atom.position[1] + atom.velocity[1] * timeStep,
          atom.position[2] + atom.velocity[2] * timeStep
        ];
        return { ...atom, position: newPosition };
      });

      atomsRef.current = nextAtoms;
      setAtoms(nextAtoms);

      const scene = sceneRef.current;
      if (scene) {
        nextAtoms.forEach((atom) => {
          const atomMesh = scene.children.find(
            (child) => child.userData?.isAtom && child.userData.atomId === atom.id
          ) as THREE.Mesh | undefined;
          if (atomMesh) {
            atomMesh.position.set(...atom.position);
          }
        });
      }

      renderAllBonds(nextAtoms, bondsRef.current);
      calculateSystemEnergy(nextAtoms, bondsRef.current);
    },
    [calculateSystemEnergy, renderAllBonds]
  );

  useEffect(() => {
    atomsRef.current = atoms;
  }, [atoms]);

  useEffect(() => {
    bondsRef.current = bonds;
  }, [bonds]);

  useEffect(() => {
    simulationParamsRef.current = simulationParams;
  }, [simulationParams]);

  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  useEffect(() => {
    calculateSystemEnergy(atomsRef.current, bondsRef.current);
  }, [simulationParams.temperature, calculateSystemEnergy]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4080ff, 0.5);
    pointLight.position.set(-10, -10, 10);
    scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    mountRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (isSimulatingRef.current) {
        updateSimulation(deltaTime);
      }

      renderer.render(scene, camera);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [updateSimulation]);

  useEffect(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (event.button === 0) {
        handleMouseClick(event);
      }
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!mouseDown) return;
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      if (modeRef.current === "select") {
        scene.rotation.y += deltaX * 0.01;
        scene.rotation.x += deltaY * 0.01;
      }
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onWheel = (event: WheelEvent) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(5, Math.min(50, camera.position.z));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    domElement.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("mousemove", onMouseMove);
    domElement.addEventListener("wheel", onWheel);
    domElement.addEventListener("contextmenu", (event) => event.preventDefault());

    return () => {
      domElement.removeEventListener("mousedown", onMouseDown);
      domElement.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("mousemove", onMouseMove);
      domElement.removeEventListener("wheel", onWheel);
    };
  }, [handleMouseClick]);

  const createBond = useCallback(() => {
    if (selectedAtoms.size !== 2) {
      alert("Please select exactly 2 atoms to create a bond");
      return;
    }

    const [atomId1, atomId2] = Array.from(selectedAtoms);
    const atom1 = atomsRef.current.find((atom) => atom.id === atomId1);
    const atom2 = atomsRef.current.find((atom) => atom.id === atomId2);
    if (!atom1 || !atom2) return;

    const exists = bondsRef.current.some(
      (bond) =>
        (bond.atom1 === atom1.id && bond.atom2 === atom2.id) ||
        (bond.atom1 === atom2.id && bond.atom2 === atom1.id)
    );
    if (exists) {
      alert("Bond already exists between these atoms");
      return;
    }

    const newBond: Bond = {
      id: `bond-${bondIdCounter.current++}`,
      atom1: atom1.id,
      atom2: atom2.id,
      type: selectedBondType,
      strength: BOND_TYPES[selectedBondType].strength,
      length: BOND_TYPES[selectedBondType].length
    };

    setBonds((prev) => {
      const updated = [...prev, newBond];
      bondsRef.current = updated;
      renderBond(newBond, atom1, atom2);
      calculateSystemEnergy(atomsRef.current, updated);
      return updated;
    });

    const previouslySelected = Array.from(selectedAtoms);
    setSelectedAtoms(new Set());
    previouslySelected.forEach((atomId) => updateAtomSelection(atomId, false));
  }, [calculateSystemEnergy, renderBond, selectedAtoms, selectedBondType, updateAtomSelection]);

  const clearWorkspace = useCallback(() => {
    setIsSimulating(false);
    setAtoms(() => {
      atomsRef.current = [];
      return [];
    });
    setBonds(() => {
      bondsRef.current = [];
      return [];
    });
    setSelectedAtoms(new Set());

    const scene = sceneRef.current;
    if (!scene) return;
    const meshesToRemove = scene.children.filter(
      (child) => child.userData?.isAtom || child.userData?.isBond || child.userData?.isGlow
    );
    meshesToRemove.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });

    calculateSystemEnergy([], []);
  }, [calculateSystemEnergy]);

  const startSimulation = useCallback(() => {
    if (!atomsRef.current.length) return;
    setIsSimulating(true);
    setAtoms((prev) => {
      const updated = prev.map((atom) => {
        const element = ELEMENTS[atom.element];
        const thermalVelocity = Math.sqrt((3 * 8.314 * simulationParamsRef.current.temperature) / element.mass) * 0.01;
        const velocity: [number, number, number] = [
          (Math.random() - 0.5) * thermalVelocity,
          (Math.random() - 0.5) * thermalVelocity,
          (Math.random() - 0.5) * thermalVelocity
        ];
        return { ...atom, velocity };
      });
      atomsRef.current = updated;
      calculateSystemEnergy(updated, bondsRef.current);
      return updated;
    });
  }, [calculateSystemEnergy]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setAtoms((prev) => {
      const updated = prev.map((atom) => ({ ...atom, velocity: [0, 0, 0] as [number, number, number] }));
      atomsRef.current = updated;
      calculateSystemEnergy(updated, bondsRef.current);
      return updated;
    });
    setSystemEnergy({ kinetic: 0, potential: 0, thermal: 0, total: 0 });
  }, [calculateSystemEnergy, stopSimulation]);

  const getMolecularFormula = useCallback(() => {
    const counts = atomsRef.current.reduce<Record<string, number>>((acc, atom) => {
      acc[atom.element] = (acc[atom.element] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([symbol, count]) => (count > 1 ? `${symbol}${count}` : symbol))
      .join("");
  }, []);

  const formatColor = (color: number) => `#${color.toString(16).padStart(6, "0")}`;

  return (
    <main className="molecular-sandbox-page">
      <div className="molecular-sandbox">
        <div className="app-header">
          <h1>{t("appTitle")}</h1>
          <p>{t("subtitle")}</p>
        </div>

        <div className="main-container">
          <div className="sidebar">
            <div className="tabs">
              <button className={activeTab === "elements" ? "active" : ""} onClick={() => setActiveTab("elements")}>
                {t("elementsTab")}
              </button>
              <button className={activeTab === "reactions" ? "active" : ""} onClick={() => setActiveTab("reactions")}>
                {t("reactionsTab")}
              </button>
              <button className={activeTab === "forces" ? "active" : ""} onClick={() => setActiveTab("forces")}>
                {t("forcesTab")}
              </button>
              <button className={activeTab === "simulation" ? "active" : ""} onClick={() => setActiveTab("simulation")}>
                {t("simulationTab")}
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "elements" && (
                <div className="elements-panel">
                  <h3>{t("addAtom")}</h3>
                  <div className="element-grid">
                    {Object.entries(ELEMENTS).map(([symbol, element]) => (
                      <button
                        key={symbol}
                        className={`element-btn ${selectedElement === symbol ? "selected" : ""}`}
                        style={{ backgroundColor: formatColor(element.color) }}
                        onClick={() => setSelectedElement(symbol as ElementKey)}
                        title={`${element.name} (${symbol})`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>

                  <h3>{t("controlsTitle")}</h3>
                  <div className="mode-controls">
                    <button className={mode === "select" ? "active" : ""} onClick={() => setMode("select")}>
                      {t("selectMode")}
                    </button>
                    <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>
                      {t("addAtom")}
                    </button>
                    <button className={mode === "delete" ? "active" : ""} onClick={() => setMode("delete")}>
                      {t("deleteMode")}
                    </button>
                    <button onClick={createBond}>{t("bondAtoms")}</button>
                  </div>

                  <div className="bond-controls">
                    <h3>{t("bondType")}</h3>
                    <select value={selectedBondType} onChange={(event) => setSelectedBondType(event.target.value as BondKey)}>
                      <option value="single">{t("single")}</option>
                      <option value="double">{t("double")}</option>
                      <option value="triple">{t("triple")}</option>
                      <option value="ionic">{t("ionic")}</option>
                      <option value="metallic">{t("metallic")}</option>
                      <option value="vanDerWaals">{t("vanDerWaals")}</option>
                      <option value="hydrogenBond">{t("hydrogenBond")}</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "reactions" && (
                <div className="reactions-panel">
                  <h3>{t("reactionTypes")}</h3>
                  <div className="reaction-grid">
                    {Object.entries(REACTION_TYPES).map(([type, reaction]) => (
                      <button
                        key={type}
                        className={`reaction-btn ${selectedReaction === type ? "selected" : ""}`}
                        style={{ borderColor: formatColor(reaction.color) }}
                        onClick={() => setSelectedReaction(type as keyof typeof REACTION_TYPES)}
                      >
                        {t(type as TranslationKey)}
                        <span className="reaction-desc">{reaction.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "forces" && (
                <div className="forces-panel">
                  <h3>{t("forces")}</h3>
                  <div className="forces-grid">
                    {FORCES.map((force) => (
                      <button
                        key={force}
                        className={`force-btn ${selectedForce === force ? "selected" : ""}`}
                        onClick={() => setSelectedForce(force)}
                      >
                        {t(force as TranslationKey)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "simulation" && (
                <div className="simulation-panel">
                  <h3>{t("simulationTab")}</h3>
                  <div className="simulation-controls">
                    <button
                      onClick={isSimulating ? stopSimulation : startSimulation}
                      className={isSimulating ? "pause" : "play"}
                    >
                      {isSimulating ? t("pauseSimulation") : t("playSimulation")}
                    </button>
                    <button onClick={resetSimulation}>{t("resetSimulation")}</button>
                    <button onClick={clearWorkspace} className="clear">
                      {t("clearWorkspace")}
                    </button>
                  </div>

                  <div className="simulation-params">
                    <label>
                      {t("temperatureLabel")}
                      <input
                        type="range"
                        min={100}
                        max={1000}
                        value={simulationParams.temperature}
                        onChange={(event) =>
                          setSimulationParams((prev) => ({ ...prev, temperature: Number(event.target.value) }))
                        }
                      />
                      <span>{simulationParams.temperature}K</span>
                    </label>

                    <label>
                      {t("pressureLabel")}
                      <input
                        type="range"
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={simulationParams.pressure}
                        onChange={(event) =>
                          setSimulationParams((prev) => ({ ...prev, pressure: Number(event.target.value) }))
                        }
                      />
                      <span>{simulationParams.pressure.toFixed(1)}atm</span>
                    </label>

                    <label>
                      {t("pHLabel")}
                      <input
                        type="range"
                        min={0}
                        max={14}
                        step={0.1}
                        value={simulationParams.pH}
                        onChange={(event) =>
                          setSimulationParams((prev) => ({ ...prev, pH: Number(event.target.value) }))
                        }
                      />
                      <span>{simulationParams.pH.toFixed(1)}</span>
                    </label>

                    <label>
                      {t("timeLabel")}
                      <input
                        type="range"
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={simulationParams.timeScale}
                        onChange={(event) =>
                          setSimulationParams((prev) => ({ ...prev, timeScale: Number(event.target.value) }))
                        }
                      />
                      <span>{simulationParams.timeScale.toFixed(1)}x</span>
                    </label>
                  </div>

                  <div className="energy-display">
                    <h4>{t("systemEnergy")}</h4>
                    <div className="energy-bar">
                      <div
                        className="energy-fill"
                        style={{ width: `${Math.min(100, systemEnergy.total / 100)}%` }}
                      />
                    </div>
                    <div className="energy-breakdown">
                      <span>
                        {t("kineticEnergy")} {systemEnergy.kinetic.toFixed(2)}
                      </span>
                      <span>
                        {t("potentialEnergy")} {systemEnergy.potential.toFixed(2)}
                      </span>
                      <span>
                        {t("thermalEnergy")} {systemEnergy.thermal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="system-info">
              <h4>{t("molecularFormula")}</h4>
              <p>{getMolecularFormula() || "None"}</p>
              <p>
                {t("totalAtoms")} {atoms.length}
              </p>
              <p>
                {t("totalBonds")} {bonds.length}
              </p>
              <p>
                {t("selectedAtoms")} {selectedAtoms.size}
              </p>
            </div>
          </div>

          <div className="viewport-container" ref={mountRef}>
            <div className="viewport-overlay">
              <div className="help-text">
                <p>{t("dragToRotate")}</p>
                <p>{t("scrollToZoom")}</p>
                <p>{t("clickToSelect")}</p>
                <p>{t("rightClickMenu")}</p>
              </div>
              <div className="mode-indicator">
                Current Mode: <strong>{mode}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .molecular-sandbox-page {
          background: linear-gradient(135deg, #0a192f 0%, #172a45 100%);
          color: #e3f2fd;
          min-height: 100vh;
          padding: 20px;
        }

        .molecular-sandbox {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: calc(100vh - 40px);
        }

        .app-header {
          text-align: center;
          padding: 10px;
          background: rgba(23, 42, 69, 0.8);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .app-header h1 {
          font-size: 2.5rem;
          margin-bottom: 5px;
          background: linear-gradient(90deg, #64b5f6, #bb86fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .app-header p {
          font-size: 1.2rem;
          color: #90caf9;
        }

        .main-container {
          display: flex;
          flex: 1;
          gap: 20px;
          min-height: 0;
        }

        .sidebar {
          width: 320px;
          background: rgba(23, 42, 69, 0.8);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 15px;
          background: rgba(13, 27, 42, 0.7);
          padding: 5px;
          border-radius: 8px;
        }

        .tabs button {
          flex: 1;
          padding: 8px 5px;
          background: transparent;
          border: none;
          color: #90caf9;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .tabs button.active {
          background: rgba(100, 181, 246, 0.2);
          color: #64b5f6;
        }

        .tabs button:hover {
          background: rgba(100, 181, 246, 0.1);
        }

        .tab-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 5px;
        }

        .tab-content::-webkit-scrollbar {
          width: 6px;
        }

        .tab-content::-webkit-scrollbar-thumb {
          background: rgba(100, 181, 246, 0.3);
          border-radius: 3px;
        }

        .element-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .element-btn {
          aspect-ratio: 1;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .element-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .element-btn.selected {
          transform: scale(1.1);
          box-shadow: 0 0 0 3px #64b5f6, 0 4px 8px rgba(0, 0, 0, 0.4);
        }

        .mode-controls {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .mode-controls button {
          padding: 10px;
          background: rgba(13, 27, 42, 0.7);
          border: none;
          border-radius: 8px;
          color: #e3f2fd;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mode-controls button.active {
          background: rgba(100, 181, 246, 0.3);
          color: #64b5f6;
        }

        .mode-controls button:hover {
          background: rgba(100, 181, 246, 0.2);
        }

        .bond-controls {
          margin-bottom: 20px;
        }

        .bond-controls select {
          width: 100%;
          padding: 10px;
          background: rgba(13, 27, 42, 0.7);
          border: 1px solid rgba(100, 181, 246, 0.3);
          border-radius: 8px;
          color: #e3f2fd;
        }

        .reaction-grid,
        .forces-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .reaction-btn,
        .force-btn {
          padding: 12px;
          background: rgba(13, 27, 42, 0.7);
          border: 2px solid transparent;
          border-radius: 8px;
          color: #e3f2fd;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reaction-btn.selected,
        .force-btn.selected {
          background: rgba(100, 181, 246, 0.2);
        }

        .reaction-btn:hover,
        .force-btn:hover {
          background: rgba(100, 181, 246, 0.1);
        }

        .reaction-desc {
          display: block;
          font-size: 0.85rem;
          margin-top: 5px;
          opacity: 0.8;
        }

        .simulation-controls {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .simulation-controls button {
          padding: 10px;
          background: rgba(13, 27, 42, 0.7);
          border: none;
          border-radius: 8px;
          color: #e3f2fd;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .simulation-controls button.play {
          background: rgba(76, 175, 80, 0.3);
        }

        .simulation-controls button.pause {
          background: rgba(244, 67, 54, 0.3);
        }

        .simulation-controls button.clear {
          background: rgba(255, 152, 0, 0.3);
        }

        .simulation-controls button:hover {
          opacity: 0.9;
        }

        .simulation-params {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .simulation-params label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.9rem;
        }

        .simulation-params input {
          width: 100%;
        }

        .energy-display {
          background: rgba(13, 27, 42, 0.7);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .energy-bar {
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          overflow: hidden;
          margin: 10px 0;
        }

        .energy-fill {
          height: 100%;
          background: linear-gradient(90deg, #64b5f6, #bb86fc);
          border-radius: 5px;
          transition: width 0.3s ease;
        }

        .energy-breakdown {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.85rem;
        }

        .system-info {
          background: rgba(13, 27, 42, 0.7);
          padding: 15px;
          border-radius: 8px;
          margin-top: auto;
        }

        .system-info h4 {
          margin-bottom: 10px;
          color: #64b5f6;
        }

        .system-info p {
          margin-bottom: 5px;
          font-size: 0.9rem;
        }

        .viewport-container {
          flex: 1;
          position: relative;
          background: #0a0a0a;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .viewport-overlay {
          position: absolute;
          top: 15px;
          left: 15px;
          pointer-events: none;
          z-index: 10;
        }

        .help-text {
          background: rgba(13, 27, 42, 0.8);
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .help-text p {
          font-size: 0.85rem;
          margin-bottom: 3px;
          color: #90caf9;
        }

        .mode-indicator {
          background: rgba(13, 27, 42, 0.8);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        h3 {
          margin: 15px 0 10px;
          color: #64b5f6;
          font-size: 1.1rem;
        }

        h3:first-child {
          margin-top: 0;
        }

        @media (max-width: 1024px) {
          .main-container {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
