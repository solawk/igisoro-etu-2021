import
{
    StartGame
} from './game.js';

import
{
    GameTable
} from "./gameTable.js";

import
{
    GameConnector
} from "./gameConnector.js";

import
{
    GetElementsSorted
} from "./rendering.js";

import * as SceneManager from "./sceneManager.js";

const canvas = document.getElementById("gameCanvas");
canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    const elements = GetElementsSorted(false);

    for (let element of elements)
    {
        if (element.Click(event.offsetX, event.offsetY)) break;
    }
}

export function LocalGameStart()
{
    const gameSpeed = 1 + (5 - gameSettings.gameSpeed) * 2;
    const reverseLevel = gameSettings.reverseLevel;
    let field =
        {
            topOccupations: [],
            bottomOccupations: []
        };

    for (let i = 0; i < 8; i++)
    {
        field.topOccupations[i] = 4;
        field.bottomOccupations[i] = 4;

        field.topOccupations[i + 8] = 0;
        field.bottomOccupations[i + 8] = 0;
    }

    LogicConnector = new GameConnector();

    LocalGame = StartGame("bottom", gameSpeed, field, reverseLevel, LogicConnector);

    gameTable = new GameTable(LogicConnector, "bottom", field, gameSpeed, "bottom");
    SceneManager.SetGameTableObject(gameTable);
    SceneManager.SetScene("game");

    LogicConnector.Callers.Game = LocalGame;
    LogicConnector.Callers.GameTable = gameTable;

    LogicConnector.OutputCallbacks.SetOccupation = gameTable.SetPitOccupation;
    LogicConnector.OutputCallbacks.AddTransfer = gameTable.CreateTransfer;
    LogicConnector.OutputCallbacks.StartMove = LocalGame.StartMove;
    LogicConnector.OutputCallbacks.SetTurn = gameTable.SetTurn;
    LogicConnector.OutputCallbacks.Reverse = gameTable.SetReverse;

    LogicConnector.InputCallbacks.SetOccupation = gameTable.SetPitOccupation;
    LogicConnector.InputCallbacks.AddTransfer = gameTable.CreateTransfer;
    LogicConnector.InputCallbacks.SetTurn = gameTable.SetTurn;
    LogicConnector.InputCallbacks.Reverse = gameTable.SetReverse;
}

export function LocalGameEnd()
{
    LocalGame = null;
    gameTable = null;

    SceneManager.SetScene("mainmenu");
}

export let LocalGame = null;
let gameTable = null;
let LogicConnector = null;
let PresentationConnector = null;

export const gameSettings =
    {
        playerName: "Player",
        gameSpeed: 4, // 1 = 900 ms per move (very slow), 700...500...300 , 5 = 100 ms per move (very fast)
        reverseLevel: 2
    };

SceneManager.SetScene("mainmenu");