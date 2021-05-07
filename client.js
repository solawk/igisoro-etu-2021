import
{
    GameTable
} from "./gameTable.js";

import
{
    GetElementsSorted
} from "./rendering.js";

import * as SceneManager from "./sceneManager.js";
import * as Subject from "./ui/uiSubject.js";
import * as Messenger from "./clientMessenger.js";

const canvas = document.getElementById("gameCanvas");
canvas.onclick = ClickHandler;

console.log(typeof (process) === "undefined");

function ClickHandler(event)
{
    const elements = GetElementsSorted(false);

    for (let element of elements)
    {
        if (element.Click(event.offsetX, event.offsetY)) break;
    }
}

const globalScope = this;
export let serverWebsocket = null;
export let serverStatus = "discon";
ConnectToServer();

export function ConnectToServer()
{
    serverStatus = "pend";
    Subject.Notify("serverPend");
    console.log("Connection pending");

    if (typeof (process) !== "undefined")
    {
        // heroku deploy
        serverWebsocket = new WebSocket("wss://igisoro.herokuapp.com");
    }
    else
    {
        // local deploy
        serverWebsocket = new WebSocket("wss://localhost:5000");
    }

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

    switch (gameSettings.firstTurn)
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

export function JoinSession()
{
    let msg = "J";

    // Code
    msg += "C" + gameSettings.joinCode.toString();
    msg += "?";

    // Player name
    msg += "N" + gameSettings.playerName;
    msg += "?";

    Messenger.SendMessage(msg);
}

export function InvalidJoinCode()
{
    Subject.Notify("invalidCode");
}

export function OpponentLostConnection()
{
    Subject.Notify("conlost");
}

export function OpponentReconnected(opponentName)
{
    gameTable.opponent = opponentName;
    Subject.Notify("recon");
}

export function DisconnectMe()
{
    Messenger.SendMessage("D");
}

export function EnterLobby(code)
{
    SceneManager.SetScene("lobby", {sessionCode: code,});
}

export function LocalGameStart()
{
    const gameSpeed = (1 + (5 - gameSettings.gameSpeed) * 2) * 100;

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

    // Field override
    /*for (let i = 0; i < 8; i++)
    {
        field.topOccupations[i] = 0;
        field.bottomOccupations[i] = 0;

        field.topOccupations[i + 8] = 0;
        field.bottomOccupations[i + 8] = 0;
    }
    field.bottomOccupations[0] = 2;
    field.bottomOccupations[2] = 1;
    field.topOccupations[5] = 2;
    field.topOccupations[10] = 1;
    field.topOccupations[11] = 1;*/

    LogicConnector = new GameConnector();

    LocalGame = game.StartGame("bottom", gameSpeed, field, gameSettings.reverseLevel, LogicConnector);

    gameTable = new GameTable(LogicConnector, "bottom", field, gameSpeed, gameSettings.rotateOccupations, "bottom", null);
    SceneManager.SetGameTableObject(gameTable);
    SceneManager.SetScene("game", {isOnline: false,});

    LogicConnector.Callers.Server = LocalGame;
    LogicConnector.Callers.Client = gameTable;

    LogicConnector.ClientToServerCallbacks.StartMove = LocalGame.StartMove;

    LogicConnector.ServerToClientCallbacks.SetOccupation = gameTable.SetPitOccupation;
    LogicConnector.ServerToClientCallbacks.AddTransfer = gameTable.CreateTransfer;
    LogicConnector.ServerToClientCallbacks.SetTurn = gameTable.SetTurn;
    LogicConnector.ServerToClientCallbacks.Reverse = gameTable.SetReverse;
    LogicConnector.ServerToClientCallbacks.GameOver = gameTable.DesignateWinner;
}

export function LocalGameEnd()
{
    LocalGame = null;
    gameTable = null;

    SceneManager.SetScene("mainmenu");
}

export function OnlineGameStart(side, stepTime, opponent, fieldString, currentTurn)
{
    const field =
        {
            topOccupations: game.TopOccFromFieldString(fieldString),
            bottomOccupations: game.BottomOccFromFieldString(fieldString)
        };

    PresentationConnector = new GameConnector();

    PresentationConnector.Callers.Server = globalScope;

    gameTable = new GameTable(PresentationConnector, currentTurn, field, stepTime, false, side, opponent);
    SceneManager.SetGameTableObject(gameTable);
    SceneManager.SetScene("game", {isOnline: true,});

    PresentationConnector.Callers.Client = gameTable;

    PresentationConnector.ClientToServerCallbacks.StartMove = Messenger.SendMove;

    PresentationConnector.ServerToClientCallbacks.SetOccupation = gameTable.SetPitOccupation;
    PresentationConnector.ServerToClientCallbacks.AddTransfer = gameTable.CreateTransfer;
    PresentationConnector.ServerToClientCallbacks.SetTurn = gameTable.SetTurn;
    PresentationConnector.ServerToClientCallbacks.Reverse = gameTable.SetReverse;
    PresentationConnector.ServerToClientCallbacks.GameOver = gameTable.DesignateWinner;
}

export let LocalGame = null;
let gameTable = null;
let LogicConnector = null;
export let PresentationConnector = null;

export const gameSettings =
    {
        playerName: "Player" + Math.floor(100 + Math.random() * 900),
        gameSpeed: 4, // 1 = 900 ms per move (very slow), 700...500...300 , 5 = 100 ms per move (very fast)
        reverseLevel: 2,
        rotateOccupations: false, // Turn pits' occupations in local multiplayer games
        firstTurn: "random", // Whether this player has the first turn when entering an online or a vs AI game
        joinCode: 100
    };

SceneManager.SetScene("mainmenu");