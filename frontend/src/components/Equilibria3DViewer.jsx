import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ============================================================================
 * EQUILIBRIA ADVANCED 3D SCULPTED PROCEDURAL ENGINE: ANGIE & KENNY
 * ============================================================================
 * Motor 3D WebGL en tiempo real desarrollado con Three.js sin imágenes 2D:
 * - Geometría orgánica esculpida (rostro con mandíbula y mejillas suaves, ojos con cavidad y párpados móviles).
 * - Cabello 3D volumétrico procedural:
 *     * Angie: Mechones y rizos 3D modelados en capas orgánicas + lentes metálicos 3D con cristales.
 *     * Kenny: Corte "librito" 3D partido al centro con caída natural y volumen superior.
 * - Ropa con modelado detallado (cuellos cisne, cordones, bolsillos cargo, cinturón y tenis con suelas).
 * - Cinemática 3D en tiempo real: Parpadeo natural, respiración sincronizada, giros 360° (manos atrás),
 *   hombros, cuello y celebración.
 */
export const Equilibria3DViewer = ({
  character = 'angie', // 'angie' | 'kenny' | 'female' | 'male'
  pose = 'neutral',     // 'neutral' | 'idle' | 'hands_behind' | 'chest_open' | 'shoulder_lift' | 'shoulder_roll' | 'shoulder_stretch' | 'neck_right' | 'neck_left' | 'neck_front' | 'stretch_up' | 'arms_stretch' | 'twist_right' | 'twist_left' | 'wrist_roll' | 'wrist_stretch' | 'inhale' | 'hold' | 'exhale' | 'breathing_abdomen' | 'eyes_closed' | 'celebrate'
  duration = 4,
  compact = false
}) => {
  const mountRef = useRef(null);
  const isAngie = character === 'angie' || character === 'female';

  const animStateRef = useRef({
    character: isAngie ? 'angie' : 'kenny',
    pose: pose || 'neutral',
    duration: duration || 4,
    time: 0
  });

  useEffect(() => {
    animStateRef.current.character = isAngie ? 'angie' : 'kenny';
    animStateRef.current.pose = pose || 'neutral';
    animStateRef.current.duration = duration || 4;
  }, [character, pose, duration, isAngie]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || (compact ? 170 : 250);
    const height = container.clientHeight || (compact ? 210 : 300);

    // 1. Escena 3D
    const scene = new THREE.Scene();

    // 2. Cámara Cinematográfica (Fov suave para retrato 3D de animación)
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0, 1.12, 4.2);
    camera.lookAt(0, 1.02, 0);

    // 3. Renderer WebGL de Alta Calidad
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Iluminación de Estudio de Cine 3D (3-Point Studio Lighting + Rim Light)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambientLight);

    // Key Light Cálida Principal con Sombra Suave
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    keyLight.position.set(2.6, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill Light Suave
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.3);
    fillLight.position.set(-3, 2, 2.5);
    scene.add(fillLight);

    // Rim Light Morada de Identidad EquilibrIA
    const rimLight = new THREE.DirectionalLight(0xc084fc, 2.6);
    rimLight.position.set(0, 3.5, -3.2);
    scene.add(rimLight);

    // 5. Disco de Sombra de Contacto Suave en el Suelo
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.12)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    scene.add(shadowMesh);

    // 6. Textura Procedural para Ojos 3D Grandes Disney
    const createEyeTexture = (irisColorHex) => {
      const eyeCanvas = document.createElement('canvas');
      eyeCanvas.width = 256;
      eyeCanvas.height = 256;
      const ctx = eyeCanvas.getContext('2d');

      // Esclera
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);

      // Sombra superior del párpado
      const scleraGrad = ctx.createLinearGradient(128, 0, 128, 256);
      scleraGrad.addColorStop(0, 'rgba(203, 213, 225, 0.6)');
      scleraGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = scleraGrad;
      ctx.fillRect(0, 0, 256, 256);

      // Iris con degradado rico y profundidad
      const iGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 88);
      iGrad.addColorStop(0, '#f59e0b');
      iGrad.addColorStop(0.55, irisColorHex);
      iGrad.addColorStop(1, '#271206');
      ctx.fillStyle = iGrad;
      ctx.beginPath();
      ctx.arc(128, 128, 88, 0, Math.PI * 2);
      ctx.fill();

      // Pupila negra
      ctx.fillStyle = '#090705';
      ctx.beginPath();
      ctx.arc(128, 128, 46, 0, Math.PI * 2);
      ctx.fill();

      // Destello especular primario (11h)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(156, 94, 28, 0, Math.PI * 2);
      ctx.fill();

      // Destello secundario (4h)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(104, 160, 15, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(eyeCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const eyeTex = createEyeTexture(isAngie ? '#854d0e' : '#78350f');

    // 7. Materiales PBR
    const skinMat = new THREE.MeshStandardMaterial({
      color: isAngie ? 0xfff0f3 : 0xfed7aa,
      roughness: 0.42,
      metalness: 0.04
    });

    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.5,
      transparent: true,
      opacity: 0.45
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: isAngie ? 0x291408 : 0x18130f,
      roughness: 0.45,
      metalness: 0.08
    });

    const topMat = new THREE.MeshStandardMaterial({
      color: isAngie ? 0xfef9c3 : 0x7c3aed,
      roughness: 0.65,
      metalness: 0.05
    });

    const collarMat = new THREE.MeshStandardMaterial({
      color: isAngie ? 0xfef08a : 0x5b21b6,
      roughness: 0.6,
      metalness: 0.05
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: isAngie ? 0xa855f7 : 0xd4b996,
      roughness: 0.6,
      metalness: 0.05
    });

    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.35,
      metalness: 0.1
    });

    const buckleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.9
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: isAngie ? 0xffffff : 0x1e293b,
      roughness: 0.35,
      metalness: 0.1
    });

    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0x581c87,
      roughness: 0.15,
      metalness: 0.85
    });

    // 8. Construcción de la Jerarquía Articulada Chibi 3D
    const root = new THREE.Group();
    scene.add(root);

    // Pelvis y Cintura
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.82;
    root.add(pelvis);

    // Cinturón de Angie
    if (isAngie) {
      const beltGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.08, 24);
      const beltMesh = new THREE.Mesh(beltGeo, beltMat);
      beltMesh.position.y = -0.02;
      pelvis.add(beltMesh);

      const buckleGeo = new THREE.BoxGeometry(0.12, 0.09, 0.06);
      const buckleMesh = new THREE.Mesh(buckleGeo, buckleMat);
      buckleMesh.position.set(0, -0.02, 0.33);
      pelvis.add(buckleMesh);
    }

    // Piernas
    const legGeo = new THREE.CapsuleGeometry(0.12, 0.44, 12, 16);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.2, -0.28, 0);
    leftLeg.castShadow = true;
    pelvis.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.2, -0.28, 0);
    rightLeg.castShadow = true;
    pelvis.add(rightLeg);

    // Bolsillos Cargo en Kenny
    if (!isAngie) {
      const pocketGeo = new THREE.BoxGeometry(0.06, 0.18, 0.14);
      const leftPocket = new THREE.Mesh(pocketGeo, pantsMat);
      leftPocket.position.set(-0.32, -0.26, 0);
      pelvis.add(leftPocket);

      const rightPocket = new THREE.Mesh(pocketGeo, pantsMat);
      rightPocket.position.set(0.32, -0.26, 0);
      pelvis.add(rightPocket);
    }

    // Calzado
    const shoeGeo = new THREE.BoxGeometry(0.22, 0.14, 0.36);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.2, -0.68, 0.06);
    leftShoe.castShadow = true;
    pelvis.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.2, -0.68, 0.06);
    rightShoe.castShadow = true;
    pelvis.add(rightShoe);

    // Suela Blanca de los Tenis de Kenny
    if (!isAngie) {
      const soleGeo = new THREE.BoxGeometry(0.23, 0.04, 0.37);
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      
      const leftSole = new THREE.Mesh(soleGeo, soleMat);
      leftSole.position.set(-0.2, -0.73, 0.06);
      pelvis.add(leftSole);

      const rightSole = new THREE.Mesh(soleGeo, soleMat);
      rightSole.position.set(0.2, -0.73, 0.06);
      pelvis.add(rightSole);
    }

    // Torso Chibi Compacto
    const spine = new THREE.Group();
    spine.position.y = 0.15;
    pelvis.add(spine);

    const torsoGeo = new THREE.CapsuleGeometry(0.32, 0.42, 16, 20);
    const torsoMesh = new THREE.Mesh(torsoGeo, topMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    spine.add(torsoMesh);

    // Cuello Cisne / Cuello de Suéter
    const collarGeo = new THREE.TorusGeometry(0.18, 0.06, 12, 24);
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 0.36;
    spine.add(collarMesh);

    const neck = new THREE.Group();
    neck.position.y = 0.38;
    spine.add(neck);

    // =========================================================================
    // CABEZA CHIBI PROTAGONISTA 3D (45% de la altura total)
    // =========================================================================
    const head = new THREE.Group();
    head.position.y = 0.38;
    neck.add(head);

    // Cráneo y Rostro Esculpido
    const headGeo = new THREE.SphereGeometry(0.58, 32, 32);
    headGeo.scale(1, 0.96, 0.92);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Mejillas Suaves con Rubor
    const cheekGeo = new THREE.SphereGeometry(0.14, 16, 16);
    cheekGeo.scale(1.2, 0.7, 0.4);

    const leftCheek = new THREE.Mesh(cheekGeo, blushMat);
    leftCheek.position.set(-0.32, -0.08, 0.44);
    head.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, blushMat);
    rightCheek.position.set(0.32, -0.08, 0.44);
    head.add(rightCheek);

    // Ojos Grandes 3D
    const eyeGeo = new THREE.SphereGeometry(0.185, 24, 24);
    const eyeMat = new THREE.MeshBasicMaterial({ map: eyeTex });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.22, 0.04, 0.46);
    leftEye.rotation.y = 0.18;
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.22, 0.04, 0.46);
    rightEye.rotation.y = -0.18;
    head.add(rightEye);

    // Párpados Dinámicos (para parpadeo y ojos cerrados)
    const eyelidGeo = new THREE.SphereGeometry(0.19, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const leftEyelid = new THREE.Mesh(eyelidGeo, skinMat);
    leftEyelid.position.set(-0.22, 0.04, 0.46);
    leftEyelid.rotation.x = -Math.PI * 0.5; // Abiertos
    head.add(leftEyelid);

    const rightEyelid = new THREE.Mesh(eyelidGeo, skinMat);
    rightEyelid.position.set(0.22, 0.04, 0.46);
    rightEyelid.rotation.x = -Math.PI * 0.5;
    head.add(rightEyelid);

    // Nariz Botón
    const noseGeo = new THREE.SphereGeometry(0.055, 16, 16);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.position.set(0, -0.06, 0.55);
    head.add(noseMesh);

    // Lentes Grandes y Delicados de Angie (Solo Angie)
    if (isAngie) {
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, 0.04, 0.54);

      const frameGeo = new THREE.TorusGeometry(0.22, 0.022, 16, 32);
      const leftFrame = new THREE.Mesh(frameGeo, glassesMat);
      leftFrame.position.set(-0.24, 0, 0);
      glassesGroup.add(leftFrame);

      const rightFrame = new THREE.Mesh(frameGeo, glassesMat);
      rightFrame.position.set(0.24, 0, 0);
      glassesGroup.add(rightFrame);

      const bridgeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.14, 12);
      const bridgeMesh = new THREE.Mesh(bridgeGeo, glassesMat);
      bridgeMesh.rotation.z = Math.PI / 2;
      bridgeMesh.position.set(0, 0.02, 0);
      glassesGroup.add(bridgeMesh);

      // Aretes de Botón Morados
      const earringGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const leftEarring = new THREE.Mesh(earringGeo, glassesMat);
      leftEarring.position.set(-0.58, -0.1, -0.05);
      head.add(leftEarring);

      const rightEarring = new THREE.Mesh(earringGeo, glassesMat);
      rightEarring.position.set(0.58, -0.1, -0.05);
      head.add(rightEarring);

      head.add(glassesGroup);
    }

    // Cabello 3D Volumétrico Esculpido
    if (isAngie) {
      // Masa de Rizos 3D Esculpidos Alrededor de la Cabeza
      const hairGroup = new THREE.Group();
      const curlGeo = new THREE.SphereGeometry(0.24, 16, 16);

      const curlPositions = [
        [-0.55, 0.2, 0.1], [0.55, 0.2, 0.1],
        [-0.6, -0.15, 0.15], [0.6, -0.15, 0.15],
        [-0.5, -0.4, 0.1], [0.5, -0.4, 0.1],
        [0, 0.55, 0.05], [-0.35, 0.48, 0.2], [0.35, 0.48, 0.2],
        [0, 0.2, -0.45], [-0.35, 0, -0.4], [0.35, 0, -0.4],
        [0, -0.25, -0.4], [-0.35, -0.3, -0.3], [0.35, -0.3, -0.3]
      ];

      curlPositions.forEach(([cx, cy, cz]) => {
        const curl = new THREE.Mesh(curlGeo, hairMat);
        curl.position.set(cx, cy, cz);
        curl.scale.set(1.1, 1, 0.9);
        curl.castShadow = true;
        hairGroup.add(curl);
      });

      head.add(hairGroup);
    } else {
      // Corte "Librito" 3D con Volumen y Mechones Laterales
      const hairGroup = new THREE.Group();
      const capGeo = new THREE.SphereGeometry(0.61, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const capMesh = new THREE.Mesh(capGeo, hairMat);
      capMesh.position.set(0, 0.05, -0.02);
      hairGroup.add(capMesh);

      const curtainGeo = new THREE.CapsuleGeometry(0.12, 0.42, 12, 16);
      const leftCurtain = new THREE.Mesh(curtainGeo, hairMat);
      leftCurtain.position.set(-0.34, 0.15, 0.42);
      leftCurtain.rotation.z = -0.35;
      hairGroup.add(leftCurtain);

      const rightCurtain = new THREE.Mesh(curtainGeo, hairMat);
      rightCurtain.position.set(0.34, 0.15, 0.42);
      rightCurtain.rotation.z = 0.35;
      hairGroup.add(rightCurtain);

      head.add(hairGroup);
    }

    // =========================================================================
    // BRAZOS ARTICULADOS 3D
    // =========================================================================
    const armGeo = new THREE.CapsuleGeometry(0.09, 0.4, 12, 16);
    const handGeo = new THREE.SphereGeometry(0.09, 16, 16);

    // Brazo Izquierdo
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.4, 0.16, 0);
    spine.add(leftShoulder);

    const leftArmMesh = new THREE.Mesh(armGeo, topMat);
    leftArmMesh.position.y = -0.22;
    leftArmMesh.castShadow = true;
    leftShoulder.add(leftArmMesh);

    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.46;
    leftShoulder.add(leftHand);

    // Brazo Derecho
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.4, 0.16, 0);
    spine.add(rightShoulder);

    const rightArmMesh = new THREE.Mesh(armGeo, topMat);
    rightArmMesh.position.y = -0.22;
    rightArmMesh.castShadow = true;
    rightShoulder.add(rightArmMesh);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -0.46;
    rightShoulder.add(rightHand);

    // =========================================================================
    // BUCLE DE RENDERIZADO Y CINEMÁTICA EN TIEMPO REAL
    // =========================================================================
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const t = clock.getElapsedTime();
      const { pose: curPose, duration: curDuration } = animStateRef.current;
      const p = (curPose || 'neutral').toLowerCase();

      let targetRotY = 0;
      let spineScaleY = 1;
      let spineScaleXZ = 1;
      let leftShoulderRotX = 0;
      let leftShoulderRotZ = 0;
      let rightShoulderRotX = 0;
      let rightShoulderRotZ = 0;
      let headTiltZ = 0;
      let headTiltX = 0;
      let rootPosY = 0;
      let eyelidCloseRot = -Math.PI * 0.5; // Ojos abiertos

      // 1. Cinemática según la postura solicitada por el ejercicio
      if (p === 'hands_behind' || p === 'chest_open' || p.includes('detr') || p.includes('pecho')) {
        // Giro 3D a la vista posterior mostrando manos entrelazadas atrás
        targetRotY = Math.PI * 0.92;
        spineScaleXZ = 1.08;
        headTiltX = -0.1;
        leftShoulderRotX = -1.1;
        leftShoulderRotZ = -0.5;
        rightShoulderRotX = -1.1;
        rightShoulderRotZ = 0.5;
      } else if (p === 'shoulder_lift' || p.includes('eleva')) {
        // Elevación continua rítmica de hombros
        const shrug = Math.sin(t * 5.5) * 0.5 + 0.5;
        leftShoulderRotZ = -0.45 * shrug;
        rightShoulderRotZ = 0.45 * shrug;
        spine.position.y = 0.15 + 0.09 * shrug;
        head.position.y = 0.38 - 0.05 * shrug;
      } else if (p === 'shoulder_roll' || p === 'shoulder_stretch' || p.includes('rotaci')) {
        // Círculos amplios de hombros
        const rollAngle = t * 4.5;
        leftShoulderRotX = Math.sin(rollAngle) * 0.6;
        leftShoulderRotZ = Math.cos(rollAngle) * 0.3 - 0.2;
        rightShoulderRotX = Math.sin(rollAngle) * 0.6;
        rightShoulderRotZ = -Math.cos(rollAngle) * 0.3 + 0.2;
      } else if (p === 'neck_right' || (p.includes('cuello') && p.includes('derech'))) {
        headTiltZ = -0.38;
        rightShoulderRotZ = -2.4; // Mano derecha sobre la cabeza
        leftShoulderRotZ = 0.15;
        eyelidCloseRot = 0; // Ojos cerrados relajados
      } else if (p === 'neck_left' || (p.includes('cuello') && p.includes('izquierd'))) {
        headTiltZ = 0.38;
        leftShoulderRotZ = 2.4; // Mano izquierda sobre la cabeza
        rightShoulderRotZ = -0.15;
        eyelidCloseRot = 0;
      } else if (p === 'stretch_up' || p === 'arms_stretch' || p.includes('arriba')) {
        leftShoulderRotZ = 2.9;
        rightShoulderRotZ = -2.9;
        spineScaleY = 1.15;
        headTiltX = -0.2;
      } else if (p === 'twist_right' || (p.includes('torsi') && p.includes('derech'))) {
        targetRotY = 0.65;
        headTiltZ = 0.15;
      } else if (p === 'twist_left' || (p.includes('torsi') && p.includes('izquierd'))) {
        targetRotY = -0.65;
        headTiltZ = -0.15;
      } else if (p === 'inhale' || p === 'inhala') {
        const speed = (Math.PI * 2) / (curDuration || 4);
        const breath = Math.sin(t * speed) * 0.5 + 0.5;
        spineScaleXZ = 1 + breath * 0.16;
        spineScaleY = 1 + breath * 0.1;
        leftShoulderRotZ = breath * 0.25;
        rightShoulderRotZ = -breath * 0.25;
        eyelidCloseRot = 0; // Ojos cerrados en inhalación
      } else if (p === 'hold' || p === 'reten_in') {
        spineScaleXZ = 1.16;
        spineScaleY = 1.1;
        eyelidCloseRot = 0;
      } else if (p === 'exhale' || p === 'exhala') {
        const speed = (Math.PI * 2) / (curDuration || 4);
        const breath = Math.cos(t * speed) * 0.5 + 0.5;
        spineScaleXZ = 1 + breath * 0.16;
        spineScaleY = 1 + breath * 0.1;
        eyelidCloseRot = -Math.PI * 0.5; // Ojos se abren al exhalar
      } else if (p === 'eyes_closed' || p === 'relaxation_eyes_closed') {
        eyelidCloseRot = 0;
      } else if (p === 'celebrate') {
        rootPosY = Math.abs(Math.sin(t * 6)) * 0.25;
        leftShoulderRotZ = 2.6 + Math.sin(t * 8) * 0.3;
        rightShoulderRotZ = -2.6 - Math.sin(t * 8) * 0.3;
        headTiltZ = Math.sin(t * 6) * 0.15;
      } else {
        // Idle / Respiración natural
        const idle = Math.sin(t * 2.2) * 0.04;
        spineScaleY = 1 + idle;
        spineScaleXZ = 1 + idle * 0.6;
        leftShoulderRotZ = idle * 0.5;
        rightShoulderRotZ = -idle * 0.5;
        headTiltZ = Math.sin(t * 1.4) * 0.05;

        // Parpadeo natural cada 3.5 segundos
        const blinkCycle = t % 3.5;
        if (blinkCycle < 0.18) {
          eyelidCloseRot = 0;
        }
      }

      // Interpolación suave (Lerp) para transiciones cinematográficas
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, targetRotY, 0.1);
      root.position.y = THREE.MathUtils.lerp(root.position.y, rootPosY, 0.12);
      spine.scale.set(spineScaleXZ, spineScaleY, spineScaleXZ);

      leftShoulder.rotation.x = THREE.MathUtils.lerp(leftShoulder.rotation.x, leftShoulderRotX, 0.12);
      leftShoulder.rotation.z = THREE.MathUtils.lerp(leftShoulder.rotation.z, leftShoulderRotZ, 0.12);

      rightShoulder.rotation.x = THREE.MathUtils.lerp(rightShoulder.rotation.x, rightShoulderRotX, 0.12);
      rightShoulder.rotation.z = THREE.MathUtils.lerp(rightShoulder.rotation.z, rightShoulderRotZ, 0.12);

      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, headTiltZ, 0.12);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, headTiltX, 0.12);

      leftEyelid.rotation.x = THREE.MathUtils.lerp(leftEyelid.rotation.x, eyelidCloseRot, 0.25);
      rightEyelid.rotation.x = THREE.MathUtils.lerp(rightEyelid.rotation.x, eyelidCloseRot, 0.25);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [character, isAngie, compact]);

  return (
    <div 
      className="equilibria-real-3d-stage"
      style={{
        position: 'relative',
        width: compact ? '170px' : '250px',
        height: compact ? '210px' : '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
      />
    </div>
  );
};

export default Equilibria3DViewer;
