import * as Game from './game.js'

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Image loading utils
// Class that loads the src image and raises it's 'loaded' flag when it's loaded, launches LoadingUpdate
function LoadingImage(src)
{
    this.loaded = false;

    this.image = new Image();
    this.image.addEventListener("load", function()
    {
        this.loaded = true;
        console.log(src + " loaded");
        LoadingUpdate();
    }.bind(this), false);
    this.image.src = src;
}

const woodenBack = new LoadingImage("images/woodenBack.png");
const pitImage = new LoadingImage("images/pitImage.png");
const borderImage = new LoadingImage("images/border.png");
const seedImage = new LoadingImage("images/seedSprite.png");

let resourcesLoaded = false;

// Sizing stuff
const screenSize = Math.max(window.innerWidth, window.innerHeight);
const canvasW = screenSize * (2 / 3);
const canvasH = canvasW * (9 / 16);
canvas.width = canvasW;
canvas.height = canvasH;
canvas.style.borderRadius = (canvasW / 50).toString() + "px";

const pitSize = canvasH / 5;

const pitGap = pitSize / 10;
const pitBorderOffset = pitSize / 4;

function Pit(side, index)
{
    this.side = side;
    this.index = index;
}

Pit.prototype.getCenterX = function()
{
    let indexX = this.index < 8 ? this.index : 15 - this.index; // 0-7 from left to right

    let sideMultiplier = this.side === "bottom" ? -1 : 1;

    let xFromCenter = indexX - 4; // -4 -3 -2 -1 1 2 3 4
    if (xFromCenter >= 0) xFromCenter++;

    let gapsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let gapsTotalDistance = gapsCount * pitGap;

    let pitsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let pitsTotalDistance = pitsCount * pitSize;

    return Math.floor(canvasW / 2 + (gapsTotalDistance + pitsTotalDistance) * sideMultiplier);
}

Pit.prototype.getCenterY = function()
{
    let row = this.index < 8 ? 0 : 1;

    let afterOffset = pitSize * (0.5 + row) + pitGap * row;

    let sideMultiplier = this.side === "bottom" ? 1 : -1;

    return Math.floor(canvasH / 2 + sideMultiplier * (pitBorderOffset + afterOffset));
}

Pit.prototype.isClicked = function(x, y)
{
    return Math.sqrt(Math.pow(x - this.getCenterX(), 2) + Math.pow(y - this.getCenterY(), 2)) < (pitSize / 2);
}

Pit.prototype.drawPit = function()
{
    ctx.drawImage(pitImage.image, this.getCenterX() - pitSize / 2, this.getCenterY() - pitSize / 2, pitSize, pitSize);
}

Pit.prototype.drawSeeds = function()
{
    let count;

    if (this.side === "bottom")
    {
        count = Game.Data.bottomOccupations[this.index];
    }
    else
    {
        count = Game.Data.topOccupations[this.index];
    }

    ctx.font = "bold 48px math";
    ctx.fillText(count, this.getCenterX() + (pitSize * (1 / 4)), this.getCenterY() - (pitSize * (1 / 4)));
}

canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    Redraw();
    ctx.font = "10px math";
    ctx.fillText("X: " + event.offsetX + " Y: " + event.offsetY, 30, 70);

    for (let i = 0; i < Pits.length; i++)
    {
        if (Pits[i].isClicked(event.offsetX, event.offsetY))
        {
            ctx.fillText("Clicked " + Pits[i].side + " №" + Pits[i].index, 30, 80);
            ctx.fillText(Game.CheckMove(Pits[i].side, Pits[i].index), 30, 90);
        }
    }
}

function LoadingUpdate()
{
    resourcesLoaded =
        woodenBack.loaded &&
        pitImage.loaded &&
        borderImage.loaded &&
        seedImage.loaded;

    if (resourcesLoaded)
    {
        Redraw();
    }
}

function DrawGameData()
{
    ctx.font = "10px math";
    ctx.fillText("top: " + Game.Data.topOccupations, 30, 230);
    ctx.fillText("bottom: " + Game.Data.bottomOccupations, 30, 240);
    ctx.fillText("hand: " + Game.Data.handOccupation, 30, 250);
    ctx.fillText("turn: " + Game.Data.turn, 30, 260);
    ctx.fillText("pit: " + Game.Data.pit, 30, 270);
    ctx.fillText("state: " + Game.Data.state, 30, 280);
}

function Redraw()
{
    if (woodenBack.loaded) ctx.drawImage(woodenBack.image, 0, 0);
    for (let i = 0; i < Pits.length; i++)
    {
        Pits[i].drawPit();
        Pits[i].drawSeeds();
    }
    if (borderImage.loaded) ctx.drawImage(borderImage.image, 0, (canvasH / 2) - (pitSize / 8), canvasW, pitSize / 4);

    DrawGameData();
}

let Pits = [];

for (let i = 0; i < 16; i++)
{
    Pits.push(new Pit("top", i));
    Pits.push(new Pit("bottom", i));
}

Game.Start("bottom", 300, Redraw);

ctx.beginPath();
ctx.rect(0, 0, canvasW, canvasH);
ctx.fillStyle = "rgba(0, 0, 0, 1)";
ctx.fill();
ctx.closePath();
ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillText("Loading resources", canvasW / 2, canvasH / 2);

// Game
let FieldBottom = [];
let FieldTop = [];
for (let i = 0; i < 8; i++)
{
    FieldBottom.push(4);
    FieldTop.push(4);
}
for (let i = 0; i < 8; i++)
{
    FieldBottom.push(0);
    FieldTop.push(0);
}