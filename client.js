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

import
{
    UI_Text
} from "./ui/uiText.js";

let StandbyText = new UI_Text("Нажмите здесь, чтобы запустить игру с указанными настройками",
    CanvasSettings.canvasW / 10,
    CanvasSettings.canvasH / 2,
    CanvasSettings.occupationFontSize);
VisualElements.add(StandbyText);

const canvas = document.getElementById("gameCanvas");
canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    if (gameScene == null)
    {
        VisualElements.delete(StandbyText);
        LocalGameStart();
        Redraw();
        return;
    }

    for (let i = 0; i < gameScene.Pits.length; i++)
    {
        if (gameScene.Pits[i].isClicked(event.offsetX, event.offsetY))
        {
            LogicConnector.OutputCallbacks.CheckMove.call(LogicConnector.Callers.Game, gameScene.Pits[i].index, gameScene.Pits[i].side);
        }
    }
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
    gameScene = new GameScene("bottom", field, gameSpeed);
    VisualElements.add(gameScene);

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