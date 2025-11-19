// game.js – 3D third-person prototype with Three.js (debug-friendly)

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threeContainer');
  const hudUsername = document.getElementById('hudUsername');
  const hudWallet = document.getElementById('hudWallet');

  if (!container) {
    console.error('threeContainer element not found in DOM.');
    return;
  }

  // ---------- 1) HUD: username + wallet ----------

  try {
    const profilesRaw = localStorage.getItem('profiles_by_wallet_v1');
    if (profilesRaw) {
      const profiles = JSON.parse(profilesRaw);
      const firstWallet = Object.keys(profiles)[0];
      if (firstWallet) {
        const profile = profiles[firstWallet];
        hudUsername.textContent = profile.username || 'Player';
        hudWallet.textContent =
          firstWallet.slice(0, 6) + '...' + firstWallet.slice(-4);
      } else {
        hudUsername.textContent = 'Player';
        hudWallet.textContent = 'No wallet';
      }
    } else {
      hudUsername.textContent = 'Player';
      hudWallet.textContent = 'No wallet';
    }
  } catch (e) {
    console.warn('Error reading profiles_by_wallet_v1', e);
    hudUsername.textContent = 'Player';
    hudWallet.textContent = 'No wallet';
  }

  // ---------- 2) Helper to get size ----------

  function getSize() {
    const rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;

    if (!width || width < 10) width = window.innerWidth;
    if (!height || height < 10) height = window.innerHeight - 80;

    return { width, height };
  }

  const { width: initW, height: initH } = getSize();

  // ---------- 3) Three.js setup ----------

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfe7ff, 30, 140);

  const camera = new THREE.PerspectiveCamera(60, initW / initH, 0.1, 300);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(initW, initH);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // ---------- 4) Lights ----------

  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x668866, 0.9);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(30, 40, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 120;
  scene.add(dirLight);

  // ---------- 5) Ground ----------

  const groundGeo = new THREE.PlaneGeometry(400, 400);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x8ecf74,
    roughness: 0.9,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- 6) Sky dome ----------

  const skyGeo = new THREE.SphereGeometry(200, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0xcfe7ff,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // ---------- 7) Player (simple avatar) ----------

  let bodyColor = '#3498db';
  let hairColor = '#2c3e50';

  const storedCharacterRaw = localStorage.getItem('currentCharacter');
  if (storedCharacterRaw) {
    try {
      const ch = JSON.parse(storedCharacterRaw);
      if (ch.bodyColor) bodyColor = ch.bodyColor;
      if (ch.hairColor) hairColor = ch.hairColor;
    } catch (e) {
      console.warn('Could not parse currentCharacter', e);
    }
  }

  const player = new THREE.Group();
  scene.add(player);

  // body
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

  // head
  const headGeo = new THREE.SphereGeometry(0.45, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xf5d1b5,
    roughness: 0.7,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.castShadow = true;
  head.position.y = 2.4;
  player.add(head);

  // hair
  const hairGeo = new THREE.SphereGeometry(
    0.47,
    16,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColor),
    roughness: 0.5,
  });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.castShadow = true;
  hair.position.y = 2.55;
  player.add(hair);

  player.position.set(0, 0, 0);

  // ---------- 8) Camera (third person) ----------

  const cameraOffset = new THREE.Vector3(0, 4, 8);
  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(player.position);

  // ---------- 9) Movement & physics ----------

  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  };

  let velocityY = 0;
  const moveSpeed = 6;
  const rotationSpeed = 6;
  const gravity = -18;
  const jumpStrength = 8;
  const floorHeight = 0;
  let playerDirection = new THREE.Vector3(0, 0, -1);

  function onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') keys.forward = true;
    if (key === 's' || key === 'arrowdown') keys.backward = true;
    if (key === 'a' || key === 'arrowleft') keys.left = true;
    if (key === 'd' || key === 'arrowright') keys.right = true;
    if (key === ' ' || key === 'spacebar') keys.jump = true;
  }

  function onKeyUp(e) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') keys.forward = false;
    if (key === 's' || key === 'arrowdown') keys.backward = false;
    if (key === 'a' || key === 'arrowleft') keys.left = false;
    if (key === 'd' || key === 'arrowright') keys.right = false;
    if (key === ' ' || key === 'spacebar') keys.jump = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // ---------- 10) Animation loop ----------

  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // movement
    const moveVector = new THREE.Vector3();
    if (keys.forward) moveVector.z -= 1;
    if (keys.backward) moveVector.z += 1;
    if (keys.left) moveVector.x -= 1;
    if (keys.right) moveVector.x += 1;

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      playerDirection.lerp(moveVector, rotationSpeed * delta);
      const angle = Math.atan2(playerDirection.x, playerDirection.z);
      player.rotation.y = angle;
    }

    const isMoving = moveVector.lengthSq() > 0;
    if (isMoving) {
      player.position.x += playerDirection.x * moveSpeed * delta;
      player.position.z += playerDirection.z * moveSpeed * delta;
    }

    const limit = 60;
    player.position.x = Math.max(-limit, Math.min(limit, player.position.x));
    player.position.z = Math.max(-limit, Math.min(limit, player.position.z));

    // jump + gravity
    const isOnGround = player.position.y <= floorHeight + 0.01;
    if (isOnGround) {
      player.position.y = floorHeight;
      velocityY = 0;
      if (keys.jump) velocityY = jumpStrength;
    } else {
      velocityY += gravity * delta;
    }

    player.position.y += velocityY * delta;
    if (player.position.y < floorHeight) {
      player.position.y = floorHeight;
      velocityY = 0;
    }

    // camera follow
    const desiredCameraPos = player.position
      .clone()
      .add(
        new THREE.Vector3(0, 3, 7).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          player.rotation.y
        )
      );

    camera.position.lerp(desiredCameraPos, 4 * delta);
    camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

    renderer.render(scene, camera);
  }

  animate();

  // ---------- 11) Resize ----------

  window.addEventListener('resize', () => {
    const { width, height } = getSize();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
});
