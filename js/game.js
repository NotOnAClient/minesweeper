var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
var title = document.getElementById("title");

canvas.style.backgroundColor = 'lightgreen';

var gameChange = false;
var winCondition = false;
var gameStart = false;

function shuffle(array) {
    // Fisher-Yates shuffle
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

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
    if (gameStart) {
        gameChange = true;
    }
})

class Tile {
    constructor(x, y, size) {
        this.id;
        this.x = x;
        this.y = y;
        this.coordinate = [{ x: this.x, y: this.y }];
        this.size = size;
        this.show = true;
        this.bomb = false;
        this.bombCount = 0;
        this.color = '#00ffff'
        ctx.strokeStyle = 'black';
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        ctx.font = '15px Arial';
    }


    draw() {
        ctx.fillStyle = this.color;
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
            this.color = '#b3ffff';
        }
        else {
            this.color = '#00ffff';
        }

        let clicked = clickedCords[0] > this.x && clickedCords[0] < this.x + this.size && clickedCords[1] > this.y && clickedCords[1] < this.y + this.size;
        if ((clicked) && gameStart) {
            if (this.bomb) {
                this.bombCount = 0;
                gameStart = false;
                winCondition = false;
                //alert('You lost.');
            }
            else {
                this.show = false;
            }

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
        this.clicked = false;
        this.boardChange = false;
    }

    __getSurroundingIndex(index) {
        let tileAboveIndex = index - this.tileCountWidth;
        let tileBelowIndex = index + this.tileCountWidth;
        let tileLeftIndex = index - 1;
        let tileRightIndex = index + 1;
        let tileUpLeftIndex = tileAboveIndex - 1;
        let tileUpRightIndex = tileAboveIndex + 1;
        let tileBottomLeftIndex = tileBelowIndex - 1;
        let tileBottomRightIndex = tileBelowIndex + 1;
        let numberIndexList = [tileAboveIndex, tileBelowIndex, tileLeftIndex, tileRightIndex, tileUpLeftIndex, tileUpRightIndex, tileBottomLeftIndex, tileBottomRightIndex];
        return numberIndexList;
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

        // Create a bomb list with all the numbers, shuffle it and apply until the bomb count is met
        for (let i = 0; i < this.tileList.length; i++) {
            this.bombList.push(i);
        }

        // Shuffle
        shuffle(this.bombList);

        // Delete unused bombs
        for (let i = this.tileList.length - 1; i > this.bombCount - 1; i--) {
            this.bombList.pop();
        }

        // Apply bombs and tile numbers
        for (let i = 0; i < this.bombCount; i++) {
            const index = this.tileList.map(e => e.id).indexOf(this.bombList[i]);
            this.tileList[index].bomb = true;
            let numberIndexList = this.__getSurroundingIndex(index);
            // Only apply numbers that are valid
            // For example, if the bomb is on the very left, make sure numbers do not apply on the other side
            for (let j = 0; j < numberIndexList.length; j++) {
                // If number out of range
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

    breakTiles(i) {
        // If Tile is destroyed and bombCount is 0
        if ((!this.tileList[i].show && this.tileList[i].bombCount == 0)) {
            let numberIndexList = this.__getSurroundingIndex(i);
            for (let j = 0; j < numberIndexList.length; j++) {
                if (!(numberIndexList[j] < 0 || numberIndexList[j] > this.tileList.length - 1)) {
                    if (this.tileList[numberIndexList[j]].bombCount == 0 || !this.tileList[numberIndexList[j]].bomb) {
                        // [up, down, left, right, topleft, topright, bottomleft, bottomright]
                        // Indexes left: 2, 4, 6
                        if (this.tileList[i].x == 0 && (j == 2 || j == 4 || j == 6)) {
                            //console.log('left');
                        }
                        else if (this.tileList[i].x == canvas.width - this.tileList[i].size && (j == 3 || j == 5 || j == 7)) {
                            //console.log('right');
                        }
                        else {
                            this.tileList[numberIndexList[j]].show = false;
                        }

                    }
                }
            }
        }

    }

    update() {
        if (gameStart) {
            for (let i = 0; i <= this.tileList.length - 1; i++) {
                ctx.beginPath();
                this.tileList[i].update();
            }
        }


        while (gameChange) {
            // let numberIndexList = this.__getSurroundingIndex(i);
            // numberIndexList.forEach(this.tileList[i].show = true);
            for (let i = 0; i < this.tileList.length; i++) {
                this.breakTiles(i);
            }
            for (let i = this.tileList.length - 1; i > 0; i--) {
                this.breakTiles(i);
            }
            gameChange = false;
        }
    }
}

const tileSize = 50;
const bombCount = 20;

var level = new Level(tileSize, bombCount);
level.createLevel();

window.requestAnimationFrame(gameLoop);
function gameLoop(timeStamp) {
    gameStart = true;
    level.update();
    if (!gameStart && !winCondition) {
        for (let i = 0; i < level.bombList.length; i++) {
            level.tileList[level.bombList[i]].color = 'red';
            level.tileList[level.bombList[i]].draw();
        }
        return;
    }
    window.requestAnimationFrame(gameLoop);
}
