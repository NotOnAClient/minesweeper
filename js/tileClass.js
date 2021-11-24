var tileClass = class Tile {
    constructor(ctx, x, y, size, bomb) {
        this.size = size;
        this.bomb = bomb;
        this.x = x;
        this.y = y;
        this.mouseX;
        this.mouseY;
        this.mouseDown;
        this.lineWidth = 2;
        this.colour = '#66ccff';
        this.highlightColour = "#FDFF47";
        this.fillStyle = this.colour;
        this.outline = 'black';
        this.hover = false;
        this.show = true;
    }

    draw() {
        // const tile = document.createElement('div');
        // tile.classList.add("tile");
        // tile.style.height = this.size;
        // tile.style.width = this.size;
        // tile.style.color = this.colour;
        // tile.style.outlineColor = this.outline;
        // tile.style.outlineWidth = this.lineWidth;
        //ctx.clearRect(this.x, this.y, this.size, this.size);
        ctx.rect(this.x + this.lineWidth, this.y + this.lineWidth, this.size, this.size);
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.outline;
        ctx.lineWidth = this.lineWidth;
        ctx.fill();
        ctx.stroke();
    }

    update() {
        this.hover = this.mouseX > this.x && this.mouseX <= this.x + this.size && this.mouseY > this.y && this.mouseY <= this.y + this.size
        if (this.hover && mouseDown) {
            this.fillStyle = this.highlightColour;
            this.show = false;
        }
        else {
            this.fillStyle = this.colour;
            this.show = true;
        }
        //console.log(this.hover);

    }

    clicked() {
        if (!this.show) {
            this.fillStyle = "#ffffff00";
        }
        return this.x, this.y;
    }
}