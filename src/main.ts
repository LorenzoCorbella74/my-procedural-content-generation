import './style.css';

import {
  /*   map, */
  generate,
  groundBones,
  groundStone,
  ground,
  wall,
  wallBottom,
  wallVoid,
} from './map';

// non si specifica /assets ma sarebbe assets/vite.svg
// import viteLogo from '/vite.svg'

const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
canvas.width = 600;
canvas.height = 600;
const ctx = canvas.getContext('2d')!;

const tileW = 30;
const tileH = 30;
const colNum = Math.ceil(canvas.width / tileW);
const rowNum = Math.ceil(canvas.height / tileH);
const gridRows = 60;
const gridCols = 60;

console.log(`Finestra di gioco: ${canvas.width}x${canvas.height}px`);
console.log(`Area di gioco: ${gridCols * tileH}x${gridRows * tileW}px`);
console.log(`Tile totali mappa: ${gridCols * gridRows}`);
console.log(
  `Tile renderizzate: ${colNum}*${colNum}=${colNum * rowNum}, rapporto ${
    ((colNum * rowNum) / (gridCols * gridRows)) * 100
  }%`
);

const map = generate(gridRows, gridCols);

const cameraOffset = {
  get x() {
    if (player.x <= canvas.width / 2) {
      return 0;
    }
    if (
      player.x > canvas.width / 2 &&
      player.x < tileW * gridCols - canvas.width / 2
    ) {
      return player.x - canvas.width / 2;
    }
    if (player.x >= tileW * gridCols - canvas.width / 2) {
      return tileW * gridCols - canvas.width;
    }
  },
  get y() {
    if (player.y <= canvas.height / 2) {
      return 0;
    }
    if (
      player.y > canvas.height / 2 &&
      player.y < tileH * gridRows - canvas.height / 2
    ) {
      return player.y - canvas.height / 2;
    }
    if (player.y >= tileH * gridRows - canvas.height / 2) {
      return tileH * gridRows - canvas.height;
    }
  },
};

// top left origin of the camera in the world space as tile number
const renderableArea = {
  get col() {
    return Math.ceil(cameraOffset.x! / tileW);
  },
  get row() {
    return Math.ceil(cameraOffset.y! / tileH);
  },
};

function buildMap() {
  const colors = {
    [groundBones]: '#8B4513', // Brown
    [groundStone]: '#A9A9A9', // Dark Gray
    [ground]: '#6b705c', // Green
    [wall]: '#808080', // Gray
    [wallBottom]: '#696969', // Dim Gray
    [wallVoid]: '#000000', // Black
  };
  for (let eachRow = 0; eachRow < gridRows; eachRow++) {
    for (let eachCol = 0; eachCol < gridCols; eachCol++) {
      let arrayIndex = eachRow * gridCols + eachCol;
      walls.push(
        new Wall(
          colors[map[arrayIndex]],
          tileH * eachCol,
          tileH * eachRow,
          map[arrayIndex]
        )
      );
    }
  }
}

let walls: Wall[] = [];

type WallTypes = 'solid' | 'empty';

class Wall {
  width: number;
  height: number;
  type: WallTypes;
  constructor(
    public color: string,
    public x: number,
    public y: number,
    type: number
  ) {
    this.width = tileW;
    this.height = tileH;
    this.type = type === 0 ? 'solid' : 'empty';
  }
}

const keys: { [key: string]: boolean } = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  a: false,
  w: false,
  s: false,
  d: false,
  p: false,
};

window.addEventListener('keydown', (e) => {
  // console.log(e, e.key);
  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

const mouse = {
  x: 0,
  y: 0,
  draw() {
    ctx.fillStyle = '#F4F269';
    ctx.fillRect(this.x - 2.5, this.y - 2.5, 5, 5);
  },
};

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX + cameraOffset.x!;
  mouse.y = e.clientY + cameraOffset.y!;
});

class Player {
  speed: number;
  width: number;
  height: number;
  oldX: number;
  oldY: number;
  radius: number;
  constructor(public x: number, public y: number) {
    this.speed = 2;
    this.width = tileW / 2;
    this.height = tileH / 2;
    this.oldX = 0;
    this.oldY = 0;
    this.radius = 7.5;
  }

  render() {
    /* ctx.fillStyle = '#457b9d';
    ctx.fillRect(
      this.x - cameraOffset.x!,
      this.y - cameraOffset.y!,
      this.width,
      this.height
    ); */
    ctx.beginPath();
    ctx.arc(
      this.x - cameraOffset.x!,
      this.y - cameraOffset.y!,
      this.radius,
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = '#457b9d';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1d3557';
    ctx.stroke();
    //
    ctx.fillStyle = 'white';
    ctx.font = '9px Arial';
    ctx.fillText(
      `${renderableArea.row}-${renderableArea.col}`,
      this.x - cameraOffset.x! - 5,
      this.y - cameraOffset.y!
    );
  }

  update() {
    this.oldX = this.x;
    this.oldY = this.y;
    if ((keys.ArrowUp || keys.w) && this.y > 0) {
      this.y -= this.speed;
      if (this.checkCollisionWithWalls()) {
        this.y = this.oldY;
      }
    }
    if (
      (keys.ArrowDown || keys.s) &&
      this.y < tileH * gridRows /* canvas.height */ - this.height
    ) {
      this.y += this.speed;
      if (this.checkCollisionWithWalls()) {
        this.y = this.oldY;
      }
    }

    if ((keys.ArrowLeft || keys.a) && this.x > 0) {
      this.x -= this.speed;
      if (this.checkCollisionWithWalls()) {
        this.x = this.oldX;
      }
    }
    if (
      (keys.ArrowRight || keys.d) &&
      this.x < tileW * gridCols /* canvas.width */ - this.width
    ) {
      this.x += this.speed;
      if (this.checkCollisionWithWalls()) {
        this.x = this.oldX;
      }
    }
  }

  /* checkCollisionWithWalls() {
    let res = false;
    for (let i = 0; i < walls.length; i++) {
      const { type, x, y, width, height } = walls[i];
      if (
        Math.abs(x - this.x) > tileW + tileH * 2 ||
        Math.abs(y - this.y) > tileW + tileH * 2
      ) {
        continue;
      }
      if (
        type == 'solid' &&
        this.x < x + width &&
        this.x + this.width > x &&
        this.y < y + height &&
        this.y + this.height > y
      ) {
        res = true;
        break;
      }
    }
    return res;
  } */
  checkCollisionWithWalls() {
    let res = false;
    for (let i = 0; i < walls.length; i++) {
      const { type, x, y, width, height } = walls[i];
      if (
        Math.abs(x - this.x) > tileW + tileH * 2 ||
        Math.abs(y - this.y) > tileW + tileH * 2
      ) {
        continue;
      }
      if (
        type === 'solid' &&
        this.circleRect(this.x, this.y, this.radius, x, y, width, height)
      ) {
        res = true;
        break;
      }
    }
    return res;
  }

  circleRect(
    cx: number,
    cy: number,
    radius: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean {
    // temporary variables to set edges for testing
    let testX: number = cx;
    let testY: number = cy;

    // which edge is closest?
    if (cx < rx) testX = rx;
    // compare to left edge
    else if (cx > rx + rw) testX = rx + rw; // right edge
    if (cy < ry) testY = ry;
    // top edge
    else if (cy > ry + rh) testY = ry + rh; // bottom edge

    // get distance from closest edges
    let distX: number = cx - testX;
    let distY: number = cy - testY;
    let distance: number = Math.sqrt(distX * distX + distY * distY);

    // if the distance is less than the radius, collision!
    if (distance <= radius) {
      return true;
    }
    return false;
  }
}

const player = new Player(80, 20);
buildMap();

const loop = () => {
  clean();
  drawMap();
  player.update();
  player.render();
  mouse.draw();

  window.requestAnimationFrame(loop);
};

function clean() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.onload = () => {
  loop();
};

const drawMap = () => {
  // console.time('draw');
  // ALL TILES
  /* for (let i = 0; i < walls.length; i++) {
    const { color, x, y, width, height } = walls[i];
    ctx.fillStyle = color;
    ctx.fillRect(x - cameraOffset.x!, y - cameraOffset.y!, width, height);
  } */
  // ONLY TILES in CAMERA
  let colStart = renderableArea.col
    ? renderableArea.col - 1
    : renderableArea.col;
  let rowStart = renderableArea.row
    ? renderableArea.row - 1
    : renderableArea.row;
  let colEnd =
    colNum + colStart == gridCols ? colNum + colStart : colNum + colStart + 1;
  let rowEnd =
    rowNum + rowStart == gridRows ? rowNum + rowStart : rowNum + rowStart + 1;
  for (let c = colStart; c < colEnd; c++) {
    for (let r = rowStart; r < rowEnd; r++) {
      let index = c + r * gridCols;
      const { color, x, y, width, height } = walls[index];
      ctx.fillStyle = color;
      ctx.fillRect(x - cameraOffset.x!, y - cameraOffset.y!, width, height);
    }
  }
  // console.timeEnd('draw')
};
