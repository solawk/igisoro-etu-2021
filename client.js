import {
    Start
} from './game.js';

import {
    Redraw,
    SetReverse
} from './rendering.js';

import * as AI from './ai.js'

const canvas = document.getElementById("gameCanvas");

// PIT

canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    const gameSpeed = parseInt(document.getElementById("speedSlider").value);
    if (Game == null)
    {
        Game = Start("bottom", gameSpeed, Redraw, SetReverse);
        Redraw(Game);
        return;
    }

    for (let i = 0; i < Game.Pits.length; i++)
    {
        if (Game.Pits[i].isClicked(event.offsetX, event.offsetY))
        {
            console.log("Clicked on a pit");
            Game.CheckMove(Game.Pits[i].index, Game.Pits[i].side);
        }
    }
}

export let Game = null;

//AI.StartEvaluation(GameScript.Game);