import * as Client from "./client.js";

export function ProcessMessage(msg)
{
    const signature = msg.slice(0, 1);
    const content = msg.slice(1);

    const params = mesutils.Parse(content);

    switch (signature)
    {
        case "S":
            Client.EnterLobby(parseInt(params.get("C")));

            break;
    }
}

export function SendMessage(msg)
{
    Client.serverWebsocket.send(msg);
}