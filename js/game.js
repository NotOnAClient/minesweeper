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

class Tile {
    constructor(x, y, size) {
        this.count;
        this.x = x;
        this.y = y;
        this.size = size;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'blue';
        ctx.lineWidth = 2;
    }


    draw() {
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fill();
        ctx.stroke();
    }

    update() {
        let hover = mouseX >= this.x && mouseX <= this.x + this.size && mouseY >= this.y && mouseY <= this.y + this.size;
        if (hover) {
            ctx.fillStyle = 'yellow';
            this.draw();
        }

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
            //console.log(tileList[i]);
            ctx.beginPath();
            tileList[i].draw();
            //ctx.fillStyle = ctx.isPointInPath(this.x, this.y) ? 'yellow' : 'blue';
            //ctx.fill();
        }
        ctx.closePath();
    };

    update() {
        for (let i = 0; i <= tileList.length - 1; i++) {
            tileList[i].update();
        }
    }
}

const tileSize = 20;
var level = new Level(tileSize);
level.createLevel();
level.drawLevel();
window.requestAnimationFrame(gameLoop);
function gameLoop(timeStamp) {
    //console.log(timeStamp);
    level.update();
    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    window.requestAnimationFrame(gameLoop);
}


