

class Game {
    constructor() {
        this.tiles = [];
        this.tileSize = 10;
        this.width = gameCanvas.width / this.tileSize;
        this.height = gameCanvas.height / this.tileSize;
        this.init();
    }
    init() {
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = new Air();
            }
        }
    }
    getPos(tile){
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++){
                if(this.tiles[y][x] == tile){
                    return {x: x, y: y};
                }
            }
        }
    }
    getTile(x, y) {
        return this.tiles[y][x];
    }
    setTile(x, y, tile) {
        if(!this.tiles[y][x].replacable) return;
        this.tiles[y][x] = eval(`new ${tile}()`);
    }
    swapTiles(x1, y1, x2, y2) {
        const temp = this.tiles[y1][x1];
        this.tiles[y1][x1] = this.tiles[y2][x2];
        this.tiles[y2][x2] = temp;
    }
    update(delta) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x].update(delta);
            }
        }
    }

}


const fpsCounter = document.querySelector('#fps');
var lastTimestamp = 0;
const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');

var selectedTile = 'Sand';

const tileSize = 10;

const gravity = 9.8;

const game = new Game();

var mouse = {
    x: 0,
    y: 0,
    down: false,
    onCanvas: false,
    cooldown: 100,
    lastPlacement: Date.now(),
    size:2
}

gameCanvas.addEventListener('mousemove', (e) => {
    if(!mouse.onCanvas) return;
    mouse.x = Math.floor(e.offsetX / tileSize);
    mouse.y = Math.floor(e.offsetY / tileSize);
});

gameCanvas.addEventListener('mousedown', (e) => {
    mouse.down = true;
});

gameCanvas.addEventListener('mouseup', (e) => {
    mouse.down = false;
});

gameCanvas.addEventListener('mouseenter', (e) => {
    mouse.onCanvas = true;
});

gameCanvas.addEventListener('mouseleave', (e) => {
    mouse.onCanvas = false;
});

startGame();

function startGame() {
    requestAnimationFrame(update);
    console.log(game);
}


function update(timestamp) {
    const delta = timestamp - lastTimestamp;
    fpsCounter.textContent = Math.round(1000 / (delta));

    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(delta);


    if(mouse.onCanvas){
        const cursor = getCursor();
        cursor.forEach((pos) => {
            ctx.fillStyle = 'rgba(255,255,255,.1)';
            ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);
        });
        if(mouse.down && Date.now() - mouse.lastPlacement > mouse.cooldown){
            cursor.forEach((pos) => {
                game.setTile(pos.x, pos.y, selectedTile);
            });
            mouse.lastPlacement = Date.now();
        }
    }



    window.requestAnimationFrame(update);
}

function getCursor(){
        const center = {x: mouse.x, y: mouse.y};
        var cursor = [];
        for(let y = center.y - mouse.size; y <= center.y + mouse.size; y++){
            const maxX = Math.floor(Math.sqrt(mouse.size**2 - (y - center.y)**2));
            for(let x = center.x - maxX; x <= center.x + maxX; x++){
                cursor.push({x: x, y: y});
            }
        }
        cursor = cursor.filter((pos) => {
            return pos.x >= 0 && pos.y >= 0 && pos.x < game.width && pos.y < game.height;
        });
        return cursor;
}

function setElement(element){
    selectedTile = element;
}

