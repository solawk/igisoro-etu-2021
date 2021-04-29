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
import * as Subject from "./ui/uiSubject.js";
import * as Messenger from "./clientMessenger.js";

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

export let serverWebsocket = null;
export let serverStatus = "discon";
ConnectToServer();

export function ConnectToServer()
{
    serverStatus = "pend";
    Subject.Notify("serverPend");
    console.log("Connection pending");

    serverWebsocket = new WebSocket("ws://localhost:8080");

    serverWebsocket.addEventListener("open", function()
    {
        serverStatus = "con";
        Subject.Notify("serverCon");
        console.log("Connected to server!");
    });

    serverWebsocket.addEventListener("close", function()
    {
        serverStatus = "discon";
        Subject.Notify("serverDiscon");
        Subject.Notify("onlineConnectionLost");
        console.log("Server connection failed");
    });

    serverWebsocket.addEventListener("message", function(event)
    {
        const message = event.data;
        Messenger.ProcessMessage(message);
    });
}

export function RequestNewSession()
{
    let msg = "N";

    // Side
    msg += "S";

    switch(gameSettings.firstTurn)
    {
        case "first":
            msg += "B";
            break;

        case "second":
            msg += "T";
            break;

        case "random":
            msg += Math.random() < 0.5 ? "B" : "T";
            break;
    }

    msg += "?";

    // Step time
    msg += "T" + gameSettings.gameSpeed.toString();
    msg += "?";

    // Reverse level
    msg += "R" + gameSettings.reverseLevel.toString();
    msg += "?";

    // Player name
    msg += "N" + gameSettings.playerName;
    msg += "?";

    Messenger.SendMessage(msg);
}

export function DisconnectMe()
{
    Messenger.SendMessage("D");
}

export function EnterLobby(code)
{
    SceneManager.SetScene("lobby", { sessionCode: code, });
}

export function LocalGameStart()
{
    const gameSpeed = 1 + (5 - gameSettings.gameSpeed) * 2;

    const field =
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

    LocalGame = game.StartGame("bottom", gameSpeed, field, gameSettings.reverseLevel, LogicConnector);

    gameTable = new GameTable(LogicConnector, "bottom", field, gameSpeed, gameSettings.rotateOccupations, "bottom");
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
        reverseLevel: 2,
        rotateOccupations: false, // Turn pits' occupations in local multiplayer games
        firstTurn: "random", // If this player has the first turn when entering an online or a vs AI game
        joinCode: 100
    };

SceneManager.SetScene("mainmenu");