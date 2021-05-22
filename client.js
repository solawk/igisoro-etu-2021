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

import
{
    AI
} from "./ai.js";

const canvas = document.getElementById("gameCanvas");
canvas.onclick = ClickHandler;

function ClickHandler(event)
{
    const elements = GetElementsSorted(false);

    for (let element of elements)
    {
        if (element.Click(event.offsetX, event.offsetY))
        {
            break;
        }
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

    // heroku deploy
    serverWebsocket = new WebSocket("wss://igisoro.herokuapp.com");

    // local deploy
    //serverWebsocket = new WebSocket("ws://localhost:5000");

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

function PingServer()
{
    Messenger.SendMessage("P");
}

setInterval(function()
{
    if (serverStatus === "con")
    {
        PingServer();
    }
}, 15000);

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

export function LocalGameStart(opponent, playerSide)
{
    if (opponent == null)
    {
        Log("local-multiplayer", gameSettings.playerName.toString() + " has entered a local session");
    }
    else
    {
        Log("vs-ai", gameSettings.playerName.toString() + " has entered a session against AI");
    }

    const gameSpeed = (1 + (5 - gameSettings.gameSpeed)) * 100;

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
    field.topOccupations[3] = 5;
    field.topOccupations[12] = 6;
    field.topOccupations[5] = 2;
    field.topOccupations[10] = 1;
    field.bottomOccupations[4] = 1;
    field.bottomOccupations[6] = 2;
    field.bottomOccupations[0] = 2;
    field.bottomOccupations[2] = 1;*/

    LogicConnector = new GameConnector();

    LocalGame = game.StartGame("bottom", gameSpeed, field, gameSettings.reverseLevel, LogicConnector);
    //LocalGame = game.StartGame("bottom", gameSpeed, field, 3, LogicConnector); // REVERSE TEST

    gameTable = new GameTable(LogicConnector, "bottom", field, gameSpeed, gameSettings.rotateOccupations, playerSide ? playerSide : "bottom", opponent);
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

export function AttachAI(side, settings)
{
    AIAgent = new AI(LogicConnector, side, settings);
    // funni test
    //const AIAgent2 = new AI(LogicConnector, side === "top" ? "bottom" : "top", settings);

    LogicConnector.ServerToClientCallbacks.SetTurn = function(turn)
    {
        gameTable.SetTurn(turn);
        AIAgent.React();
        //AIAgent2.React();
    }

    LogicConnector.ServerToClientCallbacks.Reverse = function(src)
    {
        gameTable.SetReverse(src);

        if (src !== -1)
        {
            AIAgent.React();
            //AIAgent2.React();
        }
    }
}

export function LocalGameEnd()
{
    LocalGame = null;
    gameTable = null;

    const wasvsAI = AIAgent != null;
    AIAgent = null;

    LogicConnector.ServerToClientCallbacks.SetOccupation = function() {};
    LogicConnector.ServerToClientCallbacks.AddTransfer = function() {};
    LogicConnector.ServerToClientCallbacks.SetTurn = function() {};
    LogicConnector.ServerToClientCallbacks.Reverse = function() {};
    LogicConnector.ServerToClientCallbacks.GameOver = function() {};

    if (!wasvsAI)
    {
        SceneManager.SetScene("mainmenu");
    }
    else
    {
        SceneManager.SetScene("aimenu");
    }
}

export function SetLocalGameOccupations(top, bottom)
{
    LocalGame.topOccupations = top;
    LocalGame.bottomOccupations = bottom;
}

export function TutorialGameStart()
{
    const field =
        {
            topOccupations: [],
            bottomOccupations: []
        };

    for (let i = 0; i < 16; i++)
    {
        field.topOccupations[i] = 0;
        field.bottomOccupations[i] = 0;
    }

    LogicConnector = new GameConnector();

    LocalGame = game.StartGame("bottom", 300, field, 3, LogicConnector);

    gameTable = new GameTable(LogicConnector, "bottom", field, 300, false, "bottom", null);
    SceneManager.SetGameTableObject(gameTable);

    LogicConnector.Callers.Server = LocalGame;
    LogicConnector.Callers.Client = gameTable;

    LogicConnector.ClientToServerCallbacks.StartMove = LocalGame.StartMove;

    LogicConnector.ServerToClientCallbacks.SetOccupation = gameTable.SetPitOccupation;
    LogicConnector.ServerToClientCallbacks.AddTransfer = gameTable.CreateTransfer;
    LogicConnector.ServerToClientCallbacks.Reverse = gameTable.SetReverse;

    LogicConnector.ServerToClientCallbacks.SetTurn = function(){};
    LogicConnector.ServerToClientCallbacks.GameOver = function(){};
}

export function OnlineGameStart(side, stepTime, opponent, fieldString, currentTurn)
{
    Log("online-multiplayer", gameSettings.playerName.toString() + " has entered an online session");

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

export function Log(channelName, msg)
{
    Messenger.SendMessage("LC" + channelName + "?M" + msg + "?");
}

export let LocalGame = null;
let gameTable = null;
let AIAgent = null;
let LogicConnector = null;
export let PresentationConnector = null;

export const gameSettings =
    {
        playerName: "Player" + Math.floor(100 + Math.random() * 900),
        language: "en",
        gameSpeed: 3, // 1 = 500 ms per move (very slow), 400...300...200 , 5 = 100 ms per move (very fast)
        reverseLevel: 2,
        rotateOccupations: false, // Turn pits' occupations in local multiplayer games
        firstTurn: "random", // Whether this player has the first turn when entering an online
        joinCode: 100,
        aiDifficulty: 1, // 1 - Easy (1 depth, 70% randomness), 2 - Medium (3, 50%), 3 - Hard (5, 30%)
        aiFirstTurn: "random"
    };

InitLocalStorage();

function InitLocalStorage()
{
    const storables =
        [
            "playerName",
            "language",
            "gameSpeed",
            "reverseLevel",
            "rotateOccupations",
            "aiDifficulty"
        ];

    const loaded = {};

    for (const item of storables)
    {
        let itemValue = localStorage[item];

        if (!itemValue)
        {
            localStorage.setItem(item, gameSettings[item]);
            itemValue = gameSettings[item].toString();
        }

        loaded[item] = itemValue;
    }

    gameSettings.playerName = loaded.playerName;
    gameSettings.language = loaded.language;
    gameSettings.gameSpeed = parseInt(loaded.gameSpeed);
    gameSettings.reverseLevel = parseInt(loaded.reverseLevel);
    gameSettings.rotateOccupations = loaded.rotateOccupations === "true";
    gameSettings.aiDifficulty = parseInt(loaded.aiDifficulty);
}

SceneManager.SetScene("mainmenu");