import * as Bunches from "./bunches.js";

import {
    Game
} from './client.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

export let CanvasSettings =
    {
        context: ctx,
        canvasW: 0,
        canvasH: 0,

        pitSize: 0,
        pitGap: 0,
        pitBorderOffset: 0,

        occupationFontSize: 0
    };

AdjustCanvas();

let resLoadedAmount = 0;
const resAmount = 6;

LoadingScreen();

// Core rendering function
export function Redraw(game = null)
{
    AdjustCanvas();

    ctx.drawImage(woodenBack.image, 0, 0);
    ctx.drawImage(borderImage.image, 0, (CanvasSettings.canvasH / 2) - (CanvasSettings.pitSize / 8),
        CanvasSettings.canvasW, CanvasSettings.pitSize / 4);

    if (game != null)
    {
        DrawTurnIndicator(game.turn);

        for (let i = 0; i < Game.Pits.length; i++)
        {
            Game.Pits[i].setDrawSettings(CanvasSettings);
            Game.Pits[i].draw(DrawSeeds, pitImage);
        }

        Game.Hand.setDrawSettings(CanvasSettings);
        Game.Hand.draw(DrawSeeds, pitImage);

        for (let i = 0; i < Game.Transfers.length; i++)
        {
            if (Game.Transfers[i] != null)
            {
                Game.Transfers[i].draw(DrawSeeds);
            }
        }

        DrawReverseArrows(game);
        //DrawGameData(game);
    }
    else
    {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";

        ctx.font = "bold " + CanvasSettings.occupationFontSize + "px math";
        ctx.fillText("Нажмите на поле, чтобы запустить игру",
            CanvasSettings.canvasW / 4, CanvasSettings.canvasH / 2);
    }
}

function DrawTurnIndicator(turn)
{
    if (turn === "bottom")
    {
        ctx.drawImage(turnIndicator.image, 0, CanvasSettings.canvasH * (1 - 1 / 32),
            CanvasSettings.canvasW, CanvasSettings.canvasH * (1 / 32));
    }
    else
    {
        ctx.rotate(Math.PI);

        ctx.drawImage(turnIndicator.image, -CanvasSettings.canvasW, -CanvasSettings.canvasH * (1 / 32),
            CanvasSettings.canvasW, CanvasSettings.canvasH * (1 / 32));

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

export function DrawSeeds(count, x, y)
{
    if (count === 0) return;

    let positions = Bunches.positions(count);
    let seedSize = (CanvasSettings.pitSize / 6) * Bunches.seedSize(count);

    for (let i = 0; i < positions.length; i += 2)
    {
        let sx = positions[i] * seedSize;
        let sy = -positions[i + 1] * seedSize;

        ctx.drawImage(seedImage.image, x + sx - (seedSize / 2), y + sy - (seedSize / 2), seedSize, seedSize);
    }
}

function DrawGameData(game)
{
    ctx.font = "10px math";
    ctx.fillText("top: " + game.topOccupations, 30, 230);
    ctx.fillText("bottom: " + game.bottomOccupations, 30, 240);
    ctx.fillText("hand: " + game.handOccupation, 30, 250);
    ctx.fillText("turn: " + game.turn, 30, 260);
    ctx.fillText("sowPit: " + game.sowPit, 30, 270);
    ctx.fillText("pit: " + game.pit, 30, 280);
    ctx.fillText("state: " + game.state, 30, 290);
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
    Redraw(Game);
}

function DrawReverseArrows(game)
{
    if (ReverseSource === -1) return;

    ctx.globalAlpha = (ReverseStep / 20) * 0.65;
    let distanceFromSource = (CanvasSettings.pitSize + CanvasSettings.pitGap) * Math.pow(ReverseStep / 20, 1 / 4);

    let sourcePit = Game.GetPit(game.turn, ReverseSource);

    switch (ReverseSource)
    {
        case 1:
        case 6:
        {
            DrawSingleReverseArrow(game, sourcePit, distanceFromSource, 180);
            DrawSingleReverseArrow(game, sourcePit, distanceFromSource, 0);

            break;
        }

        case 8:
        {
            DrawSingleReverseArrow(game, sourcePit, distanceFromSource, 270);
            DrawSingleReverseArrow(game, sourcePit, distanceFromSource, 0);

            break;
        }

        case 15:
        {
            DrawSingleReverseArrow(game, sourcePit, distanceFromSource, 270);
            DrawSingleReverseArrow(game, sourcePit, distanceFromSource, 180);

            break;
        }
    }

    ctx.globalAlpha = 1;
}

function DrawSingleReverseArrow(game, src, d, angle)
{
    ctx.translate(src.getCenterX(), src.getCenterY());

    let rotation = game.turn === "bottom" ? angle : angle + 180;
    ctx.rotate(rotation * Math.PI / 180);

    ctx.drawImage(arrowImage.image, -(CanvasSettings.pitSize / 4) + d, -(CanvasSettings.pitSize / 4),
        CanvasSettings.pitSize / 2, CanvasSettings.pitSize / 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function AdjustCanvas()
{
    CanvasSettings.canvasW = window.innerWidth * (9 / 10);
    if (CanvasSettings.canvasW * (9 / 16) > window.innerHeight * (9 / 10))
    {
        CanvasSettings.canvasW = window.innerHeight * (16 / 10);
    }
    CanvasSettings.canvasW *= 0.8;// WIP
    CanvasSettings.canvasH = CanvasSettings.canvasW * (9 / 16);
    CanvasSettings.pitSize = CanvasSettings.canvasH / 5;

    CanvasSettings.occupationFontSize = Math.floor(CanvasSettings.canvasW / 36);
    CanvasSettings.pitGap = CanvasSettings.pitSize / 10;
    CanvasSettings.pitBorderOffset = CanvasSettings.pitSize / 4;

    canvas.width = CanvasSettings.canvasW;
    canvas.height = CanvasSettings.canvasH;
    canvas.style.borderRadius = (CanvasSettings.canvasW / 50).toString() + "px";
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
const turnIndicator = new LoadingImage("images/turnIndicator.png");

let resourcesLoaded = false;

function LoadingUpdate()
{
    resourcesLoaded =
        woodenBack.loaded &&
        pitImage.loaded &&
        borderImage.loaded &&
        seedImage.loaded &&
        turnIndicator.loaded;

    if (resourcesLoaded)
    {
        Redraw(Game);
    }
    else
    {
        LoadingScreen();
    }
}

function LoadingScreen()
{
    ctx.beginPath();
    ctx.rect(0, 0, CanvasSettings.canvasW, CanvasSettings.canvasH);
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillText("Loading resources (" + resLoadedAmount + " of " + resAmount + ")", CanvasSettings.canvasW / 2, CanvasSettings.canvasH / 2);
}