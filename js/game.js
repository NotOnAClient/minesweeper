let canvas = document.getElementById("mainCanvas");
let title = document.getElementById("title");


class Tile {
    constructor(ctx, x, y, size) {
        this.ctx = ctx;
        this.id;
        this.x = x;
        this.y = y;
        this.coordinate = [this.x, this.y];
        this.size = size;
        this.flagged = false;
        this.show = true;
        this.bomb = false;
        this.bombClicked = false;
        this.bombCount = 0;
        this.color = '#00ffff'
        this.Leftclicked = false;
        this.rightClicked = false;
        this.hover = false;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        ctx.font = '15px Arial';
    }


    draw() {
        // Apply colour changes
        this.ctx.fillStyle = this.color;

        if (this.show) {
            this.ctx.rect(this.x, this.y, this.size, this.size);
            this.ctx.fill();
            this.ctx.stroke();
        }
        else {
            this.ctx.clearRect(this.x, this.y, this.size - 1, this.size - 1);
            // Display numbers
            if (this.bombCount > 0) {
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(this.bombCount, this.x, this.y + this.size);
            }
        }
    }

    update() {
        // Detect hover
        if (this.hover && !this.flagged) {
            this.color = '#b3ffff';
        }
        else if (this.flagged) {
            this.color = 'yellow';
        }
        else {
            this.color = '#00ffff';
        }

        // Detect if clicked
        let n = 0;

        if (this.LeftClicked) {
            if (this.bomb) {
                this.bombCount = 0;
                this.bombClicked = true;
            }
            else if (this.flagged) {
                this.flagged = false;
            }
            else {
                this.show = false;
            }

        }
        else if (this.rightClicked) {
            this.flagged = !this.flagged;
            // Returns the change in flag number
            if (this.flagged) {
                n = 1;
            }
            else if (!this.flagged) {
                n = -1;
            }
            else {
                n = 0;
            }

        }

        this.draw();
        return [n, this.bombClicked, this.id];
    }
}

class Level {
    constructor(ctx, canvas, tileSize, bombCount) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.tileList = [];
        this.bombList = [];
        this.bombCount = bombCount;
        this.tileSize = tileSize;
        this.remainingTileCount;
        this.tilesBroken = [];
        this.remainingFlagCount = this.bombCount;
        this.flagChange = false;
        this.tileCountWidth = this.canvas.width / this.tileSize;
        this.tileCountHeight = this.canvas.height / this.tileSize;
        this.clicked = false;
        this.boardChange = false;
        this.clickedCords = [];
        this.flaggedCords = [];
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

    shuffle(array) {
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

    createLevel() {
        let x = 0;
        let y = 0;
        // Generate array of tiles
        for (let i = 0; i < this.tileCountWidth * this.tileCountHeight; i++) {
            let tile = new Tile(this.ctx, x, y, this.tileSize)
            tile.id = i;
            this.tileList.push(tile);
            x += this.tileSize;
            if (x >= this.tileCountWidth * this.tileSize) {
                x = 0;
                y += this.tileSize;
            }
        }

        this.remainingTileCount = this.tileList.length - this.bombCount;

        // Create a bomb list with all the numbers, shuffle it and apply until the bomb count is met
        for (let i = 0; i < this.tileList.length; i++) {
            this.bombList.push(i);
        }

        // Shuffle
        this.shuffle(this.bombList);

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
                else if (this.tileList[index].x == this.canvas.width - this.tileSize) {
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
        if (this.tileList[i].bombCount === 0 && !this.tileList[i].show) {
            let index = this.__getSurroundingIndex(i);
            for (let j = 0; j < index.length; j++) {
                if (index[j] >= 0 && index[j] < this.tileList.length) {
                    if (!this.tileList[index[j]].show || !this.tileList[index[j]].bomb) {
                        if (this.tileList[i].x == 0) {
                            if (!(j == 2 || j == 4 || j == 6)) {
                                this.tileList[index[j]].show = false;
                            }
                        }
                        else if (this.tileList[i].x == this.canvas.width - this.tileSize) {
                            if (!(j == 3 || j == 5 || j == 7)) {
                                this.tileList[index[j]].show = false;
                            }
                        }
                        else {
                            this.tileList[index[j]].show = false;
                        }
                    }
                }
            }
        }
    }


    update(displayMineCount) {

        displayMineCount.innerHTML = 'Mines remaining: ' + this.remainingFlagCount;

        // Draw all the tiles
        for (let i = 0; i <= this.tileList.length - 1; i++) {
            this.ctx.beginPath();
            let callback = this.tileList[i].update();
            this.remainingFlagCount = this.remainingFlagCount - callback[0];

            if (callback[1]) {
                return 1;
            }

            if (!this.tileList[callback[2]].show && !this.tilesBroken.includes(callback[2])) {
                this.tilesBroken.push(callback[2]);
            }

            let hover = this.mouseX > this.tileList[i].x && this.mouseX < this.tileList[i].x + this.tileList[i].size && this.mouseY > this.tileList[i].y && this.mouseY < this.tileList[i].y + this.tileList[i].size;
            if (hover) {
                this.tileList[i].hover = true;
            }
            else {
                this.tileList[i].hover = false;
            }

            let LeftClicked = this.clickedCords[0] > this.tileList[i].x && this.clickedCords[0] < this.tileList[i].x + this.tileList[i].size && this.clickedCords[1] > this.tileList[i].y && this.clickedCords[1] < this.tileList[i].y + this.tileList[i].size;
            let rightClicked = this.flaggedCords[0] > this.tileList[i].x && this.flaggedCords[0] < this.tileList[i].x + this.tileList[i].size && this.flaggedCords[1] > this.tileList[i].y && this.flaggedCords[1] < this.tileList[i].y + this.tileList[i].size;
            if (LeftClicked) {
                this.tileList[i].LeftClicked = true;
            }
            else if (rightClicked) {
                this.tileList[i].rightClicked = true;
                this.flaggedCords[0] = null;
                this.flaggedCords[1] = null;
            }
            else {
                this.tileList[i].rightClicked = false;
            }

            this.breakTiles(i);
        }
    }
}

class Game {
    constructor(gameCanvas) {
        this.tileSize = 50;
        this.bombCount = 10;
        this.gameChange = false;
        this.winCondition;
        this.mouseX;
        this.mouseY;
        this.clickedCords = [];
        this.flaggedCords = [];
        this.canvas = gameCanvas;
        this.displayMineCount;
        this.level;
        this.pause = false;
    }

    load() {
        let ctx = this.canvas.getContext("2d");

        this.canvas.style.backgroundColor = 'lightgreen';
        this.displayMineCount = document.getElementById("mineCount");

        this.canvas.width = 500;
        this.canvas.height = 500;

        this.level = new Level(ctx, this.canvas, this.tileSize, this.bombCount);
        this.level.createLevel();

        this.canvas.addEventListener('mousemove', (e) => {
            let mousePos = this.getMousePos(this.canvas, e);
            this.mouseX = mousePos.x;
            this.mouseY = mousePos.y;
        })

        this.canvas.addEventListener('mousedown', (e) => {
            if (typeof e === 'object') {
                switch (e.button) {
                    case 0:
                        this.clickedCords = [this.mouseX, this.mouseY];
                        break;
                    case 2:
                        this.flaggedCords = [this.mouseX, this.mouseY];
                        this.level.flagChange = true;
                        break;
                }
            }
        })

        this.canvas.addEventListener('mouseup', (e) => {
            if (typeof e === 'object') {
                switch (e.button) {
                    case 0:
                        this.clickedCords = [this.mouseX, this.mouseY];
                        break;
                    case 2:
                        this.level.rightClicked = true;
                        this.level.flagChange = true;
                        break;
                }
            }
        })

        // Prevent right click menu from popping up
        window.addEventListener('contextmenu', (event) => {
            event.preventDefault()
        })

    }

    getMousePos(canvas, evt) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    gameLoop(timeStamp) {
        this.level.clickedCords = this.clickedCords;
        this.level.flaggedCords = this.flaggedCords;
        this.level.mouseX = this.mouseX;
        this.level.mouseY = this.mouseY;
        let callback = this.level.update(this.displayMineCount);

        if (callback === 1) {
            this.winCondition = false;
        }
        else if (this.level.tilesBroken.length == this.level.remainingTileCount) {
            this.winCondition = true;
        }

        // Lose condition
        if (this.winCondition === false) {
            for (let i = 0; i < this.level.bombList.length; i++) {
                this.level.tileList[this.level.bombList[i]].color = 'red';
                this.level.tileList[this.level.bombList[i]].draw();
            }
            return;
        }
        else if (this.winCondition) {
            setTimeout(() => { alert('You won!'); }, 1000);
            return;
        }

        if (this.pause) {
            return;
        }
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    start() {
        // https://stackoverflow.com/questions/33554137/js-object-in-a-canvas-game-uncaught-typeerror-cannot-read-property-x-of-undef
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

}

let game = new Game(canvas);
game.load();
game.start();