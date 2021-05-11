module.exports.Send = SendMessage;
module.exports.Receive = ProcessMessage;

const Server = require("./server");
const Utils = require("./messengerUtils");

function ProcessMessage(msg, sender)
{
    const signature = msg.slice(0, 1);
    const content = msg.slice(1);

    const params = Utils.Parse(content);
    let sessionCode;

    switch (signature)
    {
        case "N":
            // New session request
            sessionCode = Server.CreateNewSession(parseInt(params.get("T")), parseInt(params.get("R")));
            SendMessage("S" + "C" + sessionCode + "?", sender);
            Server.ConnectPlayerToSession(sessionCode, sender, params.get("N"), params.get("S") === "T");
            break;

        case "J":
            // Joining session request
            sessionCode = parseInt(params.get("C"));
            const sessionExisted = Server.ConnectPlayerToSession(sessionCode, sender, params.get("N"));
            if (!sessionExisted)
            {
                //console.log("This session " + sessionCode + " doesn't exist!");
                SendMessage("N", sender);
            }
            break;

        case "D":
            // Disconnect player request
            Server.DisconnectPlayerFromSessions(sender);
            break;

        case "M":
            // Process the move
            Server.ProcessMove(sender, parseInt(params.get("I")), params.get("S") === "B" ? "bottom" : "top");
            break;

        case "P":
            // Ping
            //console.log("Pinged");
            break;

        default:
            console.log("Default message?");
            break;
    }
}

function SendMessage(msg, ws)
{
    ws.send(msg);
}