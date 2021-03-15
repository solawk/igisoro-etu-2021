import * as GameScript from "./game.js";
import * as Bunches from "./bunches.js";

import {
    Pits,
    Hand,
    Transfers,
    GetPit
} from './client.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

export let canvasW;
export let canvasH;
export let pitSize;

export let occupationFontSize;
export let pitGap;
export let pitBorderOffset;

export let handX; // WIP
export let handY; // WIP

AdjustCanvas();

let resLoadedAmount = 0;
const resAmount = 5;

LoadingScreen();

// Core rendering function
export function Redraw()
{
    AdjustCanvas();

    ctx.drawImage(woodenBack.image, 0, 0);
    ctx.drawImage(borderImage.image, 0, (canvasH / 2) - (pitSize / 8), canvasW, pitSize / 4);

    for (let i = 0; i < Pits.length; i++)
    {
        Pits[i].draw();
    }

    Hand.draw();

    for (let i = 0; i < Transfers.length; i++)
    {
        if (Transfers[i] != null)
        {
            Transfers[i].draw();
        }
    }

    DrawReverseArrows();

    //DrawGameData();
}

export function DrawSeeds(count, x, y)
{
    if (count === 0) return;

    let positions = Bunches.positions(count);
    let seedSize = (pitSize / 6) * Bunches.seedSize(count);

    for (let i = 0; i < positions.length; i += 2)
    {
        let sx = positions[i] * seedSize;
        let sy = -positions[i + 1] * seedSize;

        ctx.drawImage(seedImage.image, x + sx - (seedSize / 2), y + sy - (seedSize / 2), seedSize, seedSize);
    }
}

function DrawGameData()
{
    ctx.font = "10px math";
    ctx.fillText("top: " + GameScript.Game.topOccupations, 30, 230);
    ctx.fillText("bottom: " + GameScript.Game.bottomOccupations, 30, 240);
    ctx.fillText("hand: " + GameScript.Game.handOccupation, 30, 250);
    ctx.fillText("turn: " + GameScript.Game.turn, 30, 260);
    ctx.fillText("startPit: " + GameScript.Game.startPit, 30, 270);
    ctx.fillText("pit: " + GameScript.Game.pit, 30, 280);
    ctx.fillText("state: " + GameScript.Game.state, 30, 290);
}

// Reverse arrows stuff

let ReverseSource = -1;
let ReverseStep = 0;
const ReverseStepMax = 20;
const ReverseStepTime = 16;

export function SetReverse(src)
{
    ReverseSource = src;

    if (ReverseSource === -1)
    {
        ReverseStep = 0;
    }
    else
    {
        setTimeout(IncreaseReverse, ReverseStepTime);
    }
}

function IncreaseReverse()
{
    ReverseStep++;
    if (ReverseStep < ReverseStepMax)
    {
        setTimeout(IncreaseReverse, ReverseStepTime);
    }
    Redraw();
}

function DrawReverseArrows()
{
    if (ReverseSource === -1) return;

    ctx.globalAlpha = (ReverseStep / 20) * 0.65;
    let distanceFromSource = (pitSize + pitGap) * Math.pow(ReverseStep / 20, 1 / 4);

    let sourcePit = GetPit(GameScript.Game.turn, ReverseSource);

    switch(ReverseSource)
    {
        case 1:
        case 6:
        {
            DrawSingleReverseArrow(sourcePit, distanceFromSource,180);
            DrawSingleReverseArrow(sourcePit, distanceFromSource, 0);

            break;
        }

        case 8:
        {
            DrawSingleReverseArrow(sourcePit, distanceFromSource, 270);
            DrawSingleReverseArrow(sourcePit, distanceFromSource, 0);

            break;
        }

        case 15:
        {
            DrawSingleReverseArrow(sourcePit, distanceFromSource, 270);
            DrawSingleReverseArrow(sourcePit, distanceFromSource, 180);

            break;
        }
    }

    ctx.globalAlpha = 1;
}

function DrawSingleReverseArrow(src, d, angle)
{
    ctx.translate(src.getCenterX(), src.getCenterY());

    let rotation = GameScript.Game.turn === "bottom" ? angle : angle + 180;
    ctx.rotate(rotation * Math.PI / 180);

    ctx.drawImage(arrowImage.image, -(pitSize / 4) + d, -(pitSize / 4), pitSize / 2, pitSize / 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function AdjustCanvas()
{
    canvasW = window.innerWidth * (9 / 10);
    if (canvasW * (9 / 16) > window.innerHeight * (9 / 10))
    {
        canvasW = window.innerHeight * (16 / 10);
    }
    canvasH = canvasW * (9 / 16);
    pitSize = canvasH / 5;

    occupationFontSize = Math.floor(canvasW / 36);
    pitGap = pitSize / 10;
    pitBorderOffset = pitSize / 4;

    handX = canvasW / 2; // WIP
    handY = canvasH / 2; // WIP

    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.borderRadius = (canvasW / 50).toString() + "px";
}

// Image loading utils
// Class that loads the src image and raises it's 'loaded' flag when it's loaded, launches LoadingUpdate
function LoadingImage(src)
{
    this.loaded = false;

    this.image = new Image();
    this.image.addEventListener("load", function()
    {
        this.loaded = true;
        resLoadedAmount++;
        LoadingUpdate();
    }.bind(this), false);
    this.image.src = src;
}

const woodenBack = new LoadingImage("images/woodenBack.png");
export const pitImage = new LoadingImage("images/pitImage.png");
const borderImage = new LoadingImage("images/border.png");
export const seedImage = new LoadingImage("images/seedSprite.png");
const arrowImage = new LoadingImage("images/arrowImage.png");

let resourcesLoaded = false;

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
    else
    {
        LoadingScreen();
    }
}

function LoadingScreen()
{
    ctx.beginPath();
    ctx.rect(0, 0, canvasW, canvasH);
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillText("Loading resources (" + resLoadedAmount + " of " + resAmount + ")", canvasW / 2, canvasH / 2);
}