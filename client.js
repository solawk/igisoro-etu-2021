import * as Game from './game.js';

import {
    Redraw,
    pitImage,
    canvasW,
    canvasH,
    pitSize,
    occupationFontSize,
    pitGap,
    pitBorderOffset,
    handX,
    handY,
    DrawSeeds
} from './rendering.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stepTime = 300; // WIP

// PIT

function Pit(side, index)
{
    this.side = side;
    this.index = index;

    this.delayedSeeds = 0; // Seeds that are currently being transferred into the pit
}

Pit.prototype.getCenterX = function()
{
    if (this.side === "hand") return handX;

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
    if (this.side === "hand") return handY;

    let row = this.index < 8 ? 0 : 1;

    let afterOffset = pitSize * (0.5 + row) + pitGap * row;

    let sideMultiplier = this.side === "bottom" ? 1 : -1;

    return Math.floor(canvasH / 2 + sideMultiplier * (pitBorderOffset + afterOffset));
}

Pit.prototype.isClicked = function(x, y)
{
    return Math.sqrt(Math.pow(x - this.getCenterX(), 2) + Math.pow(y - this.getCenterY(), 2)) < (pitSize / 2);
}

Pit.prototype.getOccupation = function()
{
    if (this.side === "bottom")
    {
        return Game.Data.bottomOccupations[this.index];
    }
    else if (this.side === "top")
    {
        return Game.Data.topOccupations[this.index];
    }
    else
    {
        return Game.Data.handOccupation;
    }
}

Pit.prototype.draw = function()
{
    if (this.side !== "hand") this.drawPit();

    let occupation = this.getOccupation() - this.delayedSeeds;
    this.drawOccupation(occupation);
    DrawSeeds(occupation, this.getCenterX(), this.getCenterY());
}

Pit.prototype.drawPit = function()
{
    ctx.drawImage(pitImage.image, this.getCenterX() - pitSize / 2, this.getCenterY() - pitSize / 2, pitSize, pitSize);
}

Pit.prototype.drawOccupation = function(occupation)
{
    ctx.fillStyle = "rgba(255, 255, 255, 1)";

    if (occupation < 20)
    {
        ctx.font = "bold " + occupationFontSize + "px math";
        ctx.fillText(occupation, this.getCenterX() + (pitSize * (1 / 4)), this.getCenterY() - (pitSize * (1 / 4)));
    }
    else
    {
        ctx.font = "bold " + (occupationFontSize * 2) + "px math";
        ctx.fillText(occupation, this.getCenterX() - occupationFontSize, this.getCenterY() + (occupationFontSize / 1.5));
    }
}

Pit.prototype.flushDelayedSeeds = function(count)
{
    this.delayedSeeds -= count;
}

export function GetPit(side, index)
{
    if (side === "hand") return Hand;

    for (let i = 0; i < Pits.length; i++)
    {
        if (Pits[i].side === side && Pits[i].index === index)
        {
            return Pits[i];
        }
    }
}

// TRANSFER

const transferSpeed = 16;

function Transfer(count, originSide, originIndex, destinationSide, destinationIndex)
{
    this.count = count;

    this.dPit = GetPit(destinationSide, destinationIndex); // Destination pit
    this.dX = this.dPit.getCenterX();
    this.dY = this.dPit.getCenterY();
    this.dPit.delayedSeeds += this.count;

    this.intervalTime = transferSpeed;
    this.steps = Math.floor(stepTime * (1 / 2) / this.intervalTime);

    let originPit = GetPit(originSide, originIndex);
    this.x = originPit.getCenterX();
    this.y = originPit.getCenterY();
    this.stepsMade = 0;
}

Transfer.prototype.step = function()
{
    this.stepsMade++;
    if (this.stepsMade === this.steps)
    {
        this.dPit.flushDelayedSeeds(this.count);

        let thisIndex = Transfers.indexOf(this);
        Transfers.splice(thisIndex, 1);
    }

    this.x += (this.dX - this.x) / 4;
    this.y += (this.dY - this.y) / 4;

    Redraw();
}

Transfer.prototype.draw = function()
{
    DrawSeeds(this.count, this.x, this.y);
}

function CreateTransfer(count, originSide, originIndex, destinationSide, destinationIndex)
{
    Transfers.push(new Transfer(count, originSide, originIndex, destinationSide, destinationIndex));
}

function MoveTransfers()
{
    let needRedraw = false;

    for (let i = 0; i < Transfers.length; i++)
    {
        if (Transfers[i] != null)
        {
            Transfers[i].step();
            needRedraw = true;
        }
    }

    if (needRedraw)
    {
        Redraw();
    }
}

setInterval(MoveTransfers, transferSpeed);

canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    for (let i = 0; i < Pits.length; i++)
    {
        if (Pits[i].isClicked(event.offsetX, event.offsetY))
        {
            Game.CheckMove(Pits[i].side, Pits[i].index);
        }
    }
}

export let Pits = [];
export let Transfers = [];

for (let i = 0; i < 16; i++)
{
    Pits.push(new Pit("top", i));
    Pits.push(new Pit("bottom", i));
}

export let Hand = new Pit("hand", 0);

Game.Start("bottom", stepTime, Redraw, CreateTransfer);