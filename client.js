import
{
    Start
} from './game.js';

import
{
    GameScene
} from "./gameScene.js";

import
{
    GameConnector
} from "./gameConnector.js";

import
{
    VisualElements,
    Redraw,
    CanvasSettings
} from "./rendering.js";

import * as UI_Factory from "./ui/uiFactory.js";

let StandbyText = UI_Factory.CreateText(0.1, 0.5,
    "Нажмите здесь, чтобы запустить игру с указанными настройками");

const canvas = document.getElementById("gameCanvas");
canvas.onclick = ClickHandler;
window.onresize = Redraw;

function ClickHandler(event)
{
    if (gameScene == null)
    {
        VisualElements.delete(StandbyText);
        LocalGameStart();
        Redraw();
        return;
    }

    gameScene.Click(event.offsetX, event.offsetY);
}

function LocalGameStart()
{
    const gameSpeed = parseInt(document.getElementById("speedSlider").value);
    let field =
        {
            topOccupations: [],
            bottomOccupations: []
        };

    for (let i = 0; i < 16; i++)
    {
        field.topOccupations[i] = parseInt(document.getElementById("t" + i).value);
        field.bottomOccupations[i] = parseInt(document.getElementById("b" + i).value);
    }

    LogicConnector = new GameConnector();

    LocalGame = Start("bottom", gameSpeed, field, LogicConnector);

    gameScene = new GameScene(LogicConnector, "bottom", field, gameSpeed);
    let gameSceneContainer = UI_Factory.CreateContainer(gameScene, 0, 0);
    VisualElements.add(gameSceneContainer);

    LogicConnector.Callers.Game = LocalGame;
    LogicConnector.Callers.GameScene = gameScene;

    LogicConnector.OutputCallbacks.SetOccupation = gameScene.SetPitOccupation;
    LogicConnector.OutputCallbacks.AddTransfer = gameScene.CreateTransfer;
    LogicConnector.OutputCallbacks.CheckMove = LocalGame.CheckMove;
    LogicConnector.OutputCallbacks.SetTurn = gameScene.SetTurn;
    LogicConnector.OutputCallbacks.Reverse = gameScene.SetReverse;

    LogicConnector.InputCallbacks.SetOccupation = gameScene.SetPitOccupation;
    LogicConnector.InputCallbacks.AddTransfer = gameScene.CreateTransfer;
    LogicConnector.InputCallbacks.SetTurn = gameScene.SetTurn;
    LogicConnector.InputCallbacks.Reverse = gameScene.SetReverse;
}

export let LocalGame = null;
let gameScene = null;
let LogicConnector = null;
let PresentationConnector = null;