var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
var title = document.getElementById("title");

canvas.style.backgroundColor = 'lightgreen';

var mouseX = 0;
var mouseY = 0;
canvas.onmousemove = function (e) {
    // important: correct mouse position:
    var rect = this.getBoundingClientRect()
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    //console.log(mouseX, mouseY);
};


var tileSize = 50;
var bombCount = 10;
var tileCountRow = (canvas.width - 4) / tileSize;
var tileCountColumn = (canvas.height - 4) / tileSize;

var tileX = 0;
var tileY = 0;

var tileList = [];
function drawRow() {
    let rowList = [];
    for (let i = 0; i < tileCountRow; i++) {
        rowList[i] = new tileClass(ctx, tileX, tileY, tileSize, false);
        //rowList[i].draw();
        tileX += tileSize;
    }
    return rowList;
}

function generateLevel() {
    for (let i = 0; i < tileCountColumn; i++) {
        tileList[i] = drawRow();
        tileX = 0;
        tileY += tileSize;
    }
}

generateLevel();
console.log(tileList);

var mouseDown = false;
canvas.onmousedown = function (e) {
    mouseDown = true;
}
canvas.onmouseup = function (e) {
    mouseDown = false;
}

var i = 0;
window.requestAnimationFrame(loop);
function loop(timeStamp) {
    for (let i = 0; i < tileList.length; i++) {
        tileList[i][i].mouseX = mouseX;
        tileList[i][i].mouseY = mouseY;
    }
    //console.log(tileList);
    if (i >= tileList.length) {
        i = 0;
    }
    tileList[0][i].draw();
    tileList[0][i].update();
    tileList[0][i].clicked();
    //console.log(tileList[i]);

    i++;
    window.requestAnimationFrame(loop);
}

