// game.js – super simple 3D playground with a visible character

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threeContainer');
  const hudUsername = document.getElementById('hudUsername');
  const hudWallet = document.getElementById('hudWallet');

  if (!container) {
    console.error('threeContainer not found');
    return;
  }

  // -------- HUD: username + wallet --------
  try {
    const profilesRaw = localStorage.getItem('profiles_by_wallet_v1');
    if (profilesRaw) {
      const profiles = JSON.parse(profilesRaw);
      const firstWallet = Object.keys(profiles)[0];
      if (firstWallet) {
        const profile = profiles[firstWallet];
        hudUsername.textContent = profile.username || 'Player';
        hudWallet.textContent = firstWallet.slice(0, 6) + '...' + firstWallet.slice(-4);
      } else {
        hudUsername.textContent = 'Player';
        hudWallet.textContent = 'No wallet';
      }
    } else {
      hudUsername.textContent = 'Player';
      hudWallet.textContent = 'No wallet';
    }
  } catch (e) {
    console.warn('HUD error', e);
    hudUsername.textContent = 'Player';
    hudWallet.textContent = 'No wallet';
  }

  // -------- Helpers for size --------
  function getSize() {
    const rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;

    if (!width || width < 10) width = window.innerWidth;
    if (!height || height < 10) height = window.innerHeight - 80;

    return { width, height };
  }

  const { width: initW, height: initH } = getSize();

  // -------- Three.js basic setup --------
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, initW / initH, 0.1, 300);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(initW, initH);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x87ceeb, 1); // آسمان آبی
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // -------- Lights --------
  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x668866, 1.0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(20, 30, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // -------- Ground (سبز روشن) --------
  const groundGeo = new THREE.PlaneGeometry(400, 400);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x00aa33, // سبز
    roughness: 0.9,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // -------- Player character --------
  let bodyColor = '#3498db';
  let hairColor = '#2c3e50';

  const storedCharacterRaw = localStorage.getItem('currentCharacter');
  if (storedCharacterRaw) {
    try {
      const ch = JSON.parse(storedCharacterRaw);
      if (ch.bodyColor) bodyColor = ch.bodyColor;
      if (ch.hairColor) hairColor = ch.hairColor;
    } catch (e) {
      console.warn('currentCharacter parse error', e);
    }
  }

  const player = new THREE.Group();
  scene.add(player);

  // بدن
  const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.4, 8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bodyColor),
    roughness: 0.6,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.position.y = 1.3;
  player.add(body);

  // سر
  const headGeo = new THREE.SphereGeometry(0.45, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xf5d1b5,
    roughness: 0.7,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.castShadow = true;
  head.position.y = 2.4;
  player.add(head);

  // مو
  const hairGeo = new THREE.SphereGeometry(0.47, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColor),
    roughness: 0.5,
  });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.castShadow = true;
  hair.position.y = 2.55;
  player.add(hair);

  player.position.set(0, 0, 0);

  // -------- Camera (سوم شخص خیلی ساده) --------
  const cameraOffset = new THREE.Vector3(0, 4, 8);
  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(player.position);

  // -------- Movement --------
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  const moveSpeed = 6;
  let playerDirection = new THREE.Vector3(0, 0, -1);

  function onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') keys.forward = true;
    if (key === 's' || key === 'arrowdown') keys.backward = true;
    if (key === 'a' || key === 'arrowleft') keys.left = true;
    if (key === 'd' || key === 'arrowright') keys.right = true;
  }

  function onKeyUp(e) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') keys.forward = false;
    if (key === 's' || key === 'arrowdown') keys.backward = false;
    if (key === 'a' || key === 'arrowleft') keys.left = false;
    if (key === 'd' || key === 'arrowright') keys.right = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // -------- Animation loop --------
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    const moveVector = new THREE.Vector3();
    if (keys.forward) moveVector.z -= 1;
    if (keys.backward) moveVector.z += 1;
    if (keys.left) moveVector.x -= 1;
    if (keys.right) moveVector.x += 1;

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      playerDirection.copy(moveVector);
      const angle = Math.atan2(playerDirection.x, playerDirection.z);
      player.rotation.y = angle;

      player.position.x += playerDirection.x * moveSpeed * delta;
      player.position.z += playerDirection.z * moveSpeed * delta;
    }

    const limit = 80;
    player.position.x = Math.max(-limit, Math.min(limit, player.position.x));
    player.position.z = Math.max(-limit, Math.min(limit, player.position.z));

    // دوربین پشت سر کاراکتر
    const desiredCameraPos = player.position
      .clone()
      .add(
        new THREE.Vector3(0, 4, 8).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          player.rotation.y
        )
      );
    camera.position.lerp(desiredCameraPos, 0.1);
    camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

    renderer.render(scene, camera);
  }

  animate();

  // -------- Resize --------
  window.addEventListener('resize', () => {
    const { width, height } = getSize();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
});
