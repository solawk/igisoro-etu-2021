import {
    Start,
    CheckMove
} from './game.js';

import {
    Redraw,
    DrawSeeds,
    SetReverse
} from './rendering.js';

import * as AI from './ai.js'

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stepTime = 300; // WIP

// PIT

export function GetPit(side, index)
{
    if (side === "hand") return Game.Hand;

    for (let i = 0; i < Game.Pits.length; i++)
    {
        if (Game.Pits[i].side === side && Game.Pits[i].index === index)
        {
            return Game.Pits[i];
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
        Redraw(Game);
    }
}

setInterval(MoveTransfers, transferSpeed);

canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    if (Game == null)
    {
        Game = Start("bottom", stepTime, Redraw, CreateTransfer, SetReverse);
        Redraw(Game);
        return;
    }

    for (let i = 0; i < Game.Pits.length; i++)
    {
        if (Game.Pits[i].isClicked(event.offsetX, event.offsetY))
        {
            console.log("Clicked on a pit");
            CheckMove(Game, Game.Pits[i].index, Game.Pits[i].side);
        }
    }
}

export let Transfers = [];

export let Game = null;

//AI.StartEvaluation(GameScript.Game);