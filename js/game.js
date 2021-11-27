var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
var title = document.getElementById("title");

canvas.style.backgroundColor = 'lightgreen';

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

var mouseX;
var mouseY;
canvas.addEventListener('mousemove', (e) => {
    var mousePos = getMousePos(canvas, e);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
})

var clickedCords = [];
canvas.addEventListener('mousedown', (e) => {
    clickedCords = [mouseX, mouseY];
})

class Tile {
    constructor(x, y, size) {
        this.id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.show = true;
        this.bomb = false;
        this.bombCount = 0;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.font = '15px Arial';
    }


    draw() {
        if (this.show) {
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.fill();
            ctx.stroke();
        }
        else {
            ctx.clearRect(this.x, this.y, this.size - 1, this.size - 1);
            if (this.bombCount > 0) {
                ctx.fillStyle = 'black';
                ctx.fillText(this.bombCount, this.x, this.y + this.size);
            }
        }

    }

    update() {
        let hover = mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size;
        if (hover) {
            ctx.fillStyle = '#b3ffff';
        }
        else {
            ctx.fillStyle = '#00ffff';
        }

        if (clickedCords[0] > this.x && clickedCords[0] < this.x + this.size && clickedCords[1] > this.y && clickedCords[1] < this.y + this.size) {
            this.show = false;
        }

        if (this.bomb) {
            ctx.fillStyle = 'red';
        }
        this.draw();
    }
}

class Level {
    constructor(tileSize, bombCount) {
        this.tileList = [];
        this.bombList = [];
        this.bombCount = bombCount;
        this.tileSize = tileSize;
        this.tileCountWidth = canvas.width / this.tileSize;
        this.tileCountHeight = canvas.height / this.tileSize;
    }

    createLevel() {
        let x = 0;
        let y = 0;
        // Generate array of tiles
        for (let i = 0; i < this.tileCountWidth * this.tileCountHeight; i++) {
            let tile = new Tile(x, y, this.tileSize)
            tile.id = i;
            this.tileList.push(tile);
            x += this.tileSize;
            if (x >= this.tileCountWidth * this.tileSize) {
                x = 0;
                y += this.tileSize;
            }
        }

        // Generate array of bombs by ID
        for (let i = 0; i < this.bombCount; i++) {
            let bombId = Math.floor(Math.random() * this.tileList.length);
            // Prevent generating repeating bombs
            if (this.bombList.includes(bombId)) {
                bombId = Math.floor(Math.random() * this.tileList.length);
                this.bombList.push(bombId);
            }
            else if (this.bombCount >= this.tileList.length) {
                throw new Error('Not enough space for bombs!');
            }
            else {
                this.bombList.push(bombId);
            }
        }

        // Apply bombs and tile numbers
        for (let i = 0; i < this.bombCount; i++) {
            const index = this.tileList.map(e => e.id).indexOf(this.bombList[i]);
            this.tileList[index].bomb = true;
            let tileAboveIndex = index - this.tileCountWidth;
            let tileBelowIndex = index + this.tileCountWidth;
            let tileLeftIndex = index - 1;
            let tileRightIndex = index + 1;
            let tileUpLeftIndex = tileAboveIndex - 1;
            let tileUpRightIndex = tileAboveIndex + 1;
            let tileBottomLeftIndex = tileBelowIndex - 1;
            let tileBottomRightIndex = tileBelowIndex + 1;
            let numberIndexList = [tileAboveIndex, tileBelowIndex, tileLeftIndex, tileRightIndex, tileUpLeftIndex, tileUpRightIndex, tileBottomLeftIndex, tileBottomRightIndex];
            // Only apply numbers that are valid
            // For example, if the bomb is on the very left, make sure numbers do not apply on the other side
            for (let j = 0; j < numberIndexList.length; j++) {
                if (numberIndexList[j] >= this.tileList.length || numberIndexList[j] < 0) {
                    // Do nothing
                }
                else if (this.tileList[index].x == 0) {
                    // [up, down, left, right, topleft, topright, bottomleft, bottomright]
                    // Indexes left of bomb: 2, 4, 6
                    if (!(j == 2 || j == 4 || j == 6)) {
                        this.tileList[numberIndexList[j]].bombCount += 1;
                    }
                }
                else if (this.tileList[index].x == canvas.width - this.tileSize) {
                    // Indexes right of bomb: 3, 5, 7
                    if (!(j == 3 || j == 5 || j == 7)) {
                        this.tileList[numberIndexList[j]].bombCount += 1;
                    }
                }
                else {
                    this.tileList[numberIndexList[j]].bombCount += 1;
                }
            }
        }
        console.log(this.tileList);

    };

    update() {
        for (let i = 0; i <= this.tileList.length - 1; i++) {
            ctx.beginPath();
            this.tileList[i].update();
        }
    }
}

const tileSize = 500 / 10;
const bombCount = 20;
var level = new Level(tileSize, bombCount);
level.createLevel();

window.requestAnimationFrame(gameLoop);
function gameLoop(timeStamp) {
    level.update();
    window.requestAnimationFrame(gameLoop);
}


