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

var tileList = [];
var mouseX;
var mouseY;
canvas.addEventListener('mousemove', (e) => {
    var mousePos = getMousePos(canvas, e);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
    //console.log(mouseX, mouseY);
})

var clickedCords = [];
canvas.addEventListener('mousedown', (e) => {
    clickedCords = [mouseX, mouseY];
})

class Tile {
    constructor(x, y, size) {
        this.count;
        this.x = x;
        this.y = y;
        this.size = size;
        this.show = true;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = '#00ffff';
        ctx.lineWidth = 2;
    }


    draw() {
        if (this.show) {
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.fill();
            ctx.stroke();
        }
        else {
            ctx.clearRect(this.x, this.y, this.size - 1, this.size - 1);
        }

    }

    update() {
        let hover = mouseX >= this.x && mouseX <= this.x + this.size && mouseY >= this.y && mouseY <= this.y + this.size;
        if (hover) {
            ctx.fillStyle = '#b3ffff';
        }
        else {
            ctx.fillStyle = '#00ffff';
        }

        if (clickedCords[0] >= this.x && clickedCords[0] <= this.x + this.size && clickedCords[1] >= this.y && clickedCords[1] <= this.y + this.size) {
            this.show = false;
        }

        this.draw();
    }
}

class Level {
    constructor(tileSize) {
        this.tileCountWidth = canvas.width / tileSize;
        this.tileCountHeight = canvas.height / tileSize;
    }

    createLevel() {
        let x = 0;
        let y = 0;
        for (let i = 0; i < this.tileCountWidth * this.tileCountHeight; i++) {
            let tile = new Tile(x, y, tileSize)
            tile.count = i + 1;
            tileList.push(tile);
            x += tileSize;
            if (x >= this.tileCountWidth * tileSize) {
                x = 0;
                y += tileSize;
            }
        }
        console.log(tileList);
    };

    drawLevel() {
        for (let i = 0; i <= tileList.length - 1; i++) {
            ctx.beginPath();
            tileList[i].draw();
        }
    };

    update() {
        for (let i = 0; i <= tileList.length - 1; i++) {
            ctx.beginPath();
            tileList[i].update();
        }
    }
}

const tileSize = 20;
var level = new Level(tileSize);
level.createLevel();

window.requestAnimationFrame(gameLoop);
function gameLoop(timeStamp) {
    level.update();
    window.requestAnimationFrame(gameLoop);
}


