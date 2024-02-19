export const groundBones: number = 3;
export const groundStone: number = 2;
export const ground: number = 1;
export const wall: number = 0;
export const wallBottom: number = -1;
export const wallVoid: number = -2;


const ITERATIONS = 4;

/**
 * Genera un dungeon dati in input il:
- num di tile in larghezza(col) e
- num di tile in altezza(row)
 */
export function generate(row: number, col: number) {
  let tiles: boolean[] = [];
  let tileMap: number[] = [];

  function createBaseTileMap() {
    for (let j = 0; j < row; j++) {
      for (let i = 0; i < col; i++) {
        const solid: boolean = Math.random() < 0.45;
        tiles.push(solid);
      }
    }
    toTileSet();
    for (let i = 0; i < ITERATIONS; i++) {
      iterate();
    }
  }

  function iterate() {
    iterateTiles();
    toTileSet();
  }

  /* genera le diverse tipologie ti tile */
  function toTileSet() {
    tileMap = [];

    for (let j = 0; j < row; j++) {
      for (let i = 0; i < col; i++) {
        const solid: boolean = isSolid(i, j);
        const solidBelow: boolean = isSolid(i, j + 1);
        const num: number = numWallsAround(i, j);

        if (num === 9) {
          tileMap.push(wallVoid);
        } else if (solid) {
          if (solidBelow) {
            tileMap.push(wall);
          } else {
            tileMap.push(wallBottom);
          }
        } else {
          if (Math.random() < 0.02) {
            if (Math.random() < 0.5) {
              tileMap.push(groundStone);
            } else {
              tileMap.push(groundBones);
            }
          } else {
            tileMap.push(ground);
          }
        }
      }
    }
  }

  // guarda se per ogni tile quelle intorno sono > 5
  function iterateTiles() {
    const newTiles: boolean[] = [];

    for (let j = 0; j < row; j++) {
      for (let i = 0; i < col; i++) {
        const num: number = numWallsAround(i, j);
        const newTile: boolean = num >= 5;

        newTiles.push(newTile);
      }
    }

    tiles = newTiles;
  }

  function numWallsAround(x: number, y: number): number {
    let num: number = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (isSolid(x + i, y + j)) {
          num++;
        }
      }
    }

    return num;
  }

  function isSolid(x: number, y: number): boolean {
    if (x < 0 || x >= col || y < 0 || y >= row) {
      return true;
    }

    return tiles[x + y * col];
  }

  createBaseTileMap();

  return tileMap;
}
