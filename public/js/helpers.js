//
function generateGrid(worldSize) {
  const grid = [];
  const gridUnitSize = 32;
  const gridEdge = Math.floor(worldSize / gridUnitSize);
  for (let x = 0; x < gridEdge; x++) {
      for (let y = 0; y < gridEdge; y++) {
          let gridX = x * gridUnitSize;
          let gridY = y * gridUnitSize;
          grid.push({x: gridX, y: gridY});
      }
  }
  return grid;
  // return shuffle(grid);
}

function getUniqueRandomLocation() {
  const gridIndex = 0;
  const x = this.grid[gridIndex].x;
  const y = this.grid[gridIndex].y;
  this.grid.splice(gridIndex, 1);
  gridIndex++;
  if (gridIndex === this.grid.length) {
      this.shuffle(this.grid);
      gridIndex = 0;
  }
  return {x, y};
}

