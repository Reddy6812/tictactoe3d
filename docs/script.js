(() => {
  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/(window.innerHeight), 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({antialias:true});
  const container = document.getElementById('game-container');
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1,1,1).normalize();
  scene.add(directionalLight);

  // Create 3x3x3 grid
  const cellSize = 1;
  const spacing = 1.2;
  const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
  const defaultMaterial = new THREE.MeshPhongMaterial({color: 0xdddddd, transparent: true, opacity: 0.5});
  const xMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
  const oMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
  const cells = [];
  let currentPlayer = 'X';
  const board = {};

  for(let x=0; x<3; x++){
    for(let y=0; y<3; y++){
      for(let z=0; z<3; z++){
        const cube = new THREE.Mesh(geometry, defaultMaterial.clone());
        cube.position.set(
          (x - 1) * spacing,
          (y - 1) * spacing,
          (z - 1) * spacing
        );
        cube.userData = { x, y, z };
        scene.add(cube);
        cells.push(cube);
      }
    }
  }

  camera.position.set(3,3,5);
  camera.lookAt(0,0,0);

  // Raycaster for click
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cells);
    if (intersects.length > 0) {
      const cube = intersects[0].object;
      const { x, y, z } = cube.userData;
      const key = `${x}${y}${z}`;
      if (board[key]) return;
      if (currentPlayer === 'X') {
        cube.material = xMaterial.clone();
        board[key] = 'X';
        currentPlayer = 'O';
      } else {
        cube.material = oMaterial.clone();
        board[key] = 'O';
        currentPlayer = 'X';
      }
      checkWin();
    }
  }

  renderer.domElement.addEventListener('click', onClick);

  function checkWin() {
    // All winning lines
    const lines = [];
    // Rows
    for (let z = 0; z < 3; z++) {
      for (let y = 0; y < 3; y++) {
        lines.push([[0,y,z],[1,y,z],[2,y,z]]);
      }
    }
    // Columns
    for (let z = 0; z < 3; z++) {
      for (let x = 0; x < 3; x++) {
        lines.push([[x,0,z],[x,1,z],[x,2,z]]);
      }
    }
    // Vertical
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        lines.push([[x,y,0],[x,y,1],[x,y,2]]);
      }
    }
    // Diagonals on layers
    for (let z = 0; z < 3; z++) {
      lines.push([[0,0,z],[1,1,z],[2,2,z]]);
      lines.push([[0,2,z],[1,1,z],[2,0,z]]);
    }
    // Vertical diagonals
    for (let x = 0; x < 3; x++) {
      lines.push([[x,0,0],[x,1,1],[x,2,2]]);
      lines.push([[x,2,0],[x,1,1],[x,0,2]]);
    }
    for (let y = 0; y < 3; y++) {
      lines.push([[0,y,0],[1,y,1],[2,y,2]]);
      lines.push([[2,y,0],[1,y,1],[0,y,2]]);
    }
    // Space diagonals
    lines.push([[0,0,0],[1,1,1],[2,2,2]]);
    lines.push([[2,0,0],[1,1,1],[0,2,2]]);
    lines.push([[0,2,0],[1,1,1],[2,0,2]]);
    lines.push([[2,2,0],[1,1,1],[0,0,2]]);

    for (const line of lines) {
      const [a,b,c] = line;
      const keyA = `${a[0]}${a[1]}${a[2]}`;
      const keyB = `${b[0]}${b[1]}${b[2]}`;
      const keyC = `${c[0]}${c[1]}${c[2]}`;
      if (board[keyA] && board[keyA] === board[keyB] && board[keyA] === board[keyC]) {
        setTimeout(() => alert(`${board[keyA]} wins!`), 10);
        renderer.domElement.removeEventListener('click', onClick);
        return;
      }
    }
    // Draw
    if (Object.keys(board).length === 27) {
      setTimeout(() => alert('Draw!'), 10);
      renderer.domElement.removeEventListener('click', onClick);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();

  // 2D button
  document.getElementById('btn-2d').addEventListener('click', () => {
    window.location.href = 'https://reddy6812.github.io/tictactoegame/';
  });
})(); 