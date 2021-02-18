const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Image loading utils
function LoadingImage(src)
{
    this.loaded = false;

    this.image = new Image();
    this.image.addEventListener("load", function()
    {
        this.loaded = true;
        console.log(src + " loaded");
        Redraw();
    }.bind(this), false);
    this.image.src = src;
}

const woodenBack = new LoadingImage("images/woodenBack.png");
const pitImage = new LoadingImage("images/pitImage.png");
const borderImage = new LoadingImage("images/border.png");

// Sizing stuff
const screenSize = Math.max(screen.width, screen.height);
const canvasW = screenSize / 2;
const canvasH = canvasW * (9 / 16);
canvas.width = canvasW;
canvas.height = canvasH;

const pitSize = canvasH / 5;

const pitGap = pitSize / 10;
const pitBorderOffset = pitSize / 4;

function Pit(bottomSide, index)
{
    this.bottomSide = bottomSide;
    this.index = index;
}

Pit.prototype.getCenterX = function()
{
    let indexX = this.index < 8 ? this.index : 15 - this.index; // 0-7 from left to right

    let xFromCenter = indexX - 4; // -4 -3 -2 -1 1 2 3 4
    if (xFromCenter >= 0) xFromCenter++;

    let gapsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let gapsTotalDistance = gapsCount * pitGap;

    let pitsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let pitsTotalDistance = pitsCount * pitSize;

    return Math.floor(canvasW / 2 + gapsTotalDistance + pitsTotalDistance);
}

Pit.prototype.getCenterY = function()
{
    let row = this.index < 8 ? 0 : 1;

    let afterOffset = pitSize * (0.5 + row) + pitGap * row;

    let sideMultiplier = this.bottomSide ? 1 : -1;

    return Math.floor(canvasH / 2 + sideMultiplier * (pitBorderOffset + afterOffset));
}

Pit.prototype.drawPit = function()
{
    if (pitImage.loaded) ctx.drawImage(pitImage.image, this.getCenterX() - pitSize / 2, this.getCenterY() - pitSize / 2, pitSize, pitSize);
}

canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    Redraw();
    ctx.fillText("X: " + event.offsetX + " Y: " + event.offsetY, 30, 70);
}

function Redraw()
{
    if (woodenBack.loaded) ctx.drawImage(woodenBack.image, 0, 0);
    for (let i = 0; i < Pits.length; i++)
    {
        Pits[i].drawPit();
    }
    if (borderImage.loaded) ctx.drawImage(borderImage.image, 0, (canvasH / 2) - (pitSize / 8), canvasW, pitSize / 4);

    console.log("Redraw");
}

let Pits = [];

for (let i = 0; i < 16; i++)
{
    Pits.push(new Pit(false, i));
    Pits.push(new Pit(true, i));
}
