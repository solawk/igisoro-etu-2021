const WebSocket = require("ws");
//const Discord = require("discord.js");
//const DiscordClient = new Discord.Client();

const Sessions = require("./sessionInstance");
const Messenger = require("./serverMessenger");
const game = require("./game");

const Server = new WebSocket.Server({port: process.env.PORT || 80, clientTracking: true,});

const ClientMap = [];

Server.on("connection", function(ws)
{
    console.log("Client connected");

    // Add to the client map
    ClientMap.push({socket: ws, connectionTimestamp: Date.now()});

    ws.on("message", function(message)
    {
        Messenger.Receive(message, ws);
    });

    ws.on("close", function()
    {
        // Find the client in the map and calculate the connection time, delete from the map
        for (const client of ClientMap)
        {
            if (client.socket === ws)
            {
                const connectionDuration = Date.now() - client.connectionTimestamp;
                const durationSecondsString = Math.ceil(connectionDuration / 1000).toString();
                //LogDiscord("login-duration", durationSecondsString);

                ClientMap.splice(ClientMap.indexOf(client), 1);
                break;
            }
        }

        DisconnectPlayerFromSessions(ws);
    });
});

const defaultField =
    {
        topOccupations: [],
        bottomOccupations: []
    };

for (let i = 0; i < 8; i++)
{
    defaultField.topOccupations[i] = 4;
    defaultField.bottomOccupations[i] = 4;

    defaultField.topOccupations[i + 8] = 0;
    defaultField.bottomOccupations[i + 8] = 0;
}

// Override
/*
for (let i = 0; i < 16; i++)
{
    defaultField.topOccupations[i] = 0;
    defaultField.bottomOccupations[i] = 0;
}
defaultField.topOccupations[0] = 2;
defaultField.topOccupations[2] = 1;
defaultField.bottomOccupations[0] = 2;
defaultField.bottomOccupations[2] = 1;
 */

const DefaultSessionSettings =
    {
        side: "bottom",
        stepTime: 300,
        field: defaultField,
        reverseLevel: 2,
    };

console.log("Server up!");

module.exports.CreateNewSession = CreateNewSession;

function CreateNewSession(stepTime, reverseLevel)
{
    let code = 100;

    while (Sessions.GetSession(code) != null)
    {
        code++;
    }

    const settings = {};
    Object.assign(settings, DefaultSessionSettings);

    settings.side = "bottom";
    settings.stepTime = (1 + (5 - stepTime)) * 100;
    settings.reverseLevel = reverseLevel;

    Sessions.NewSession(code, settings);

    return code;
}

function RemoveSession(code)
{
    Sessions.DeleteSession(code);
}

module.exports.ConnectPlayerToSession = ConnectPlayerToSession;

function ConnectPlayerToSession(code, player, name, isTop)
{
    if (Sessions.GetSession(code) == null)
    {
        return false;
    }

    const thisSession = Sessions.GetSession(code);
    if (thisSession.bottomPlayer != null && thisSession.topPlayer != null)
    {
        return false;
    }

    Sessions.GetSession(code).connectPlayer(player, name, isTop);
    let opponentWS;
    let isConnectingBottom;
    if (Sessions.GetSession(code).bottomPlayer === player)
    {
        opponentWS = Sessions.GetSession(code).topPlayer;
        isConnectingBottom = true;
    }
    else
    {
        opponentWS = Sessions.GetSession(code).bottomPlayer;
        isConnectingBottom = false;
    }

    Sessions.GetSession(code).statusAddPlayer();

    const stepTime = Sessions.GetSession(code).settings.stepTime;

    if (Sessions.GetSession(code).status === "Full")
    {
        // Switch the game to playing

        const bottomPlayerWS = Sessions.GetSession(code).bottomPlayer;
        const topPlayerWS = Sessions.GetSession(code).topPlayer;

        const bottomPlayerName = Sessions.GetSession(code).bottomName;
        const topPlayerName = Sessions.GetSession(code).topName;

        const fieldString = game.FieldToString(Sessions.GetSession(code).game.topOccupations, Sessions.GetSession(code).game.bottomOccupations);
        const currentTurn = Sessions.GetSession(code).game.turn;

        Messenger.Send("GSB?T" + stepTime.toString() + "?" + "O" + topPlayerName + "?F" + fieldString + "?C" + currentTurn + "?", bottomPlayerWS);
        Messenger.Send("GST?T" + stepTime.toString() + "?" + "O" + bottomPlayerName + "?F" + fieldString + "?C" + currentTurn + "?", topPlayerWS);

        Sessions.GetSession(code).updateStatus("Playing");

        return true;
    }

    if (Sessions.GetSession(code).status === "Playing")
    {
        Messenger.Send("RN" + name + "?", opponentWS);

        const fieldString = game.FieldToString(Sessions.GetSession(code).game.topOccupations, Sessions.GetSession(code).game.bottomOccupations);
        const currentTurn = Sessions.GetSession(code).game.turn;

        if (isConnectingBottom)
        {
            const topPlayerName = Sessions.GetSession(code).topName;
            Messenger.Send("GSB?T" + stepTime.toString() + "?" + "O" + topPlayerName + "?F" + fieldString + "?C" + currentTurn + "?", player);
        }
        else
        {
            const bottomPlayerName = Sessions.GetSession(code).bottomName;
            Messenger.Send("GST?T" + stepTime.toString() + "?" + "O" + bottomPlayerName + "?F" + fieldString + "?C" + currentTurn + "?", player);
        }

        return true;
    }
}

module.exports.DisconnectPlayerFromSessions = DisconnectPlayerFromSessions;

function DisconnectPlayerFromSessions(player)
{
    for (const [code, session] of Sessions.SessionsMap)
    {
        let playerHasBeenDisconnected = false;
        let opponentWS;

        if (session.bottomPlayer === player)
        {
            session.disconnectPlayer(false);
            playerHasBeenDisconnected = true;

            if (session.topPlayer != null)
            {
                opponentWS = session.topPlayer;
            }
        }

        if (session.topPlayer === player)
        {
            session.disconnectPlayer(true);
            playerHasBeenDisconnected = true;

            if (session.bottomPlayer != null)
            {
                opponentWS = session.bottomPlayer;
            }
        }

        if (opponentWS != null)
        {
            Messenger.Send("L", opponentWS);
        }

        if (playerHasBeenDisconnected)
        {
            const isAbandoned = session.statusRemovePlayer();

            if (isAbandoned)
            {
                RemoveSession(code);
            }
        }
    }
}

module.exports.ProcessMove = ProcessMove;

function ProcessMove(player, index, side)
{
    let session = null;
    let playerSide = null;

    for (const [c, s] of Sessions.SessionsMap)
    {
        if (s.bottomPlayer === player)
        {
            session = s;
            playerSide = "bottom";
            break;
        }

        if (s.topPlayer === player)
        {
            session = s;
            playerSide = "top";
            break;
        }
    }

    if (session == null)
    {
        //console.log("Move received but this player's not playing!");
        return;
    }

    if (side !== playerSide)
    {
        //console.log("Player tries to move opponent's seeds");
        return;
    }

    //console.log("Delegating move " + index + " " + side);
    session.connector.ClientToServerCallbacks.StartMove.call(session.connector.Server, index, side);
}

module.exports.SendMessageToPlayersOfSession = SendMessageToPlayersOfSession;

function SendMessageToPlayersOfSession(code, msg)
{
    const session = Sessions.SessionsMap.get(code);

    if (session.bottomPlayer != null)
    {
        Messenger.Send(msg, session.bottomPlayer);
    }

    if (session.topPlayer != null)
    {
        Messenger.Send(msg, session.topPlayer);
    }
}

// Discord

/*DiscordClient.login(process.env.TOKEN);
const DiscordChannels = new Map;

DiscordClient.on("ready", function()
{
    console.log("Discord connected!");

    for (const [snowflake, channel] of DiscordClient.channels.cache)
    {
        DiscordChannels.set(channel.name, channel);
    }
});
*/
module.exports.LogDiscord = LogDiscord;

function LogDiscord(channelName, msg)
  {

  }
/*
function LogDiscord(channelName, msg)
{
    const channel = DiscordChannels.get(channelName);

    if (!channel) console.log("Invalid channel name: " + channelName);
    channel.send(msg);
}
*/
