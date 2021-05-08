const game = require("./game");
const gameConnector = require("./gameConnector");
const Server = require("./server");

const SessionsMap = new Map;

module.exports.SessionsMap = SessionsMap;
module.exports.NewSession = NewSession;
module.exports.DeleteSession = DeleteSession;
module.exports.GetSession = GetSession;

function NewSession(code, settings)
{
    const newSession = new Session(settings);
    SessionsMap.set(code, newSession);

    newSession.connector = new gameConnector.GameConnector();
    newSession.game = game.StartGame
    (
        newSession.settings.side,
        newSession.settings.stepTime,
        newSession.settings.field,
        newSession.settings.reverseLevel,
        newSession.connector
    );

    newSession.connector.Server = newSession.game;
    newSession.connector.ClientToServerCallbacks.StartMove = newSession.connector.Server.StartMove;

    newSession.connector.ServerToClientCallbacks.SetOccupation = function(side, index, occ)
    {
        let msg = "!Aset?";
        msg += "S" + side + "?";
        msg += "I" + index.toString() + "?";
        msg += "O" + occ.toString() + "?";

        Server.SendMessageToPlayersOfSession(code, msg);
    };

    newSession.connector.ServerToClientCallbacks.AddTransfer = function(count, oS, oI, dS, dI)
    {
        let msg = "!Atransfer?";
        msg += "C" + count.toString() + "?";
        msg += "F" + oS + "?";
        msg += "O" + oI.toString() + "?";
        msg += "T" + dS + "?";
        msg += "D" + dI.toString() + "?";

        Server.SendMessageToPlayersOfSession(code, msg);
    };

    newSession.connector.ServerToClientCallbacks.SetTurn = function(turn)
    {
        const fieldString = game.FieldToString(newSession.game.topOccupations, newSession.game.bottomOccupations);

        let msg = "!Aturn?";
        msg += "T" + turn + "?";
        msg += "F" + fieldString + "?";

        Server.SendMessageToPlayersOfSession(code, msg);
    };

    newSession.connector.ServerToClientCallbacks.Reverse = function(src)
    {
        let msg = "!Areverse?";
        msg += "S" + src + "?";

        Server.SendMessageToPlayersOfSession(code, msg);
    };

    newSession.connector.ServerToClientCallbacks.GameOver = function(winnerSide)
    {
        let msg = "!Aover?";
        msg += "W" + winnerSide + "?";

        Server.SendMessageToPlayersOfSession(code, msg);
        SessionsMap.delete(code);
    };

    return newSession;
}

function DeleteSession(code)
{
    SessionsMap.delete(code);
}

function GetSession(code)
{
    return SessionsMap.get(code);
}

module.exports.Session = Session;

function Session(settings)
{
    // Player websockets
    this.bottomPlayer = null;
    this.topPlayer = null;

    // Player names
    this.bottomName = null;
    this.topName = null;

    this.status = "Empty";
    // Statuses:
    // Empty - just created, no players
    // Abandoned - abandoned by the players, none present
    // Waiting - waiting for an opponent to connect, 1 player
    // Full - opponent connected
    // Playing - in-game
    // Conlost - one of the players lost connection but can reconnect

    this.connector = null;
    this.game = null;

    // Game settings
    this.settings = settings;
}

Session.prototype.connectPlayer = function(playerWS, playerName, isTop)
{
    if (isTop == null)
    {
        if (this.bottomPlayer == null)
        {
            this.bottomPlayer = playerWS;
            this.bottomName = playerName;
        }
        else
        {
            this.topPlayer = playerWS;
            this.topName = playerName;
        }

        return;
    }

    if (isTop)
    {
        this.topPlayer = playerWS;
        this.topName = playerName;
    }
    else
    {
        this.bottomPlayer = playerWS;
        this.bottomName = playerName;
    }
}

Session.prototype.disconnectPlayer = function(isTop)
{
    if (isTop)
    {
        this.topPlayer = null;
        this.topName = null;
    }
    else
    {
        this.bottomPlayer = null;
        this.bottomName = null;
    }
}

Session.prototype.updateStatus = function(newStatus)
{
    this.status = newStatus;
}

Session.prototype.statusAddPlayer = function()
{
    if (this.status === "Empty")
    {
        this.updateStatus("Waiting");
        return false;
    }

    if (this.status === "Waiting")
    {
        this.updateStatus("Full");
        return true;
    }

    if (this.status === "Conlost")
    {
        this.updateStatus("Playing");
        return true;
    }
}

Session.prototype.statusRemovePlayer = function()
{
    if (this.status === "Playing")
    {
        this.updateStatus("Conlost");
        return false;
    }

    if (this.status === "Full")
    {
        this.updateStatus("Waiting");
        return false;
    }

    if (this.status === "Conlost")
    {
        this.updateStatus("Abandoned");
        return true;
    }

    if (this.status === "Waiting")
    {
        this.updateStatus("Abandoned");
        return true;
    }
}