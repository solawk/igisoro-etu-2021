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

        case "N":
            Client.InvalidJoinCode();

            break;

        case "L":
            Client.OpponentLostConnection();

            break;

        case "R":
            Client.OpponentReconnected(params.get("N"));

            break;

        case "G":
            const side = params.get("S") === "B" ? "bottom" : "top";
            OnlineSessionStart(side, parseInt(params.get("T")), params.get("O"), params.get("F"), params.get("C"));

            break;

        case "!":
            const action = params.get("A");

            switch (action)
            {
                case "set":
                    Client.PresentationConnector.ServerToClientCallbacks.SetOccupation.call
                    (
                        Client.PresentationConnector.Callers.Client,
                        params.get("S"),
                        parseInt(params.get("I")),
                        parseInt(params.get("O"))
                    );

                    break;

                case "transfer":
                    Client.PresentationConnector.ServerToClientCallbacks.AddTransfer.call
                    (
                        Client.PresentationConnector.Callers.Client,
                        parseInt(params.get("C")),
                        params.get("F"),
                        parseInt(params.get("O")),
                        params.get("T"),
                        parseInt(params.get("D"))
                    );

                    break;

                case "turn":
                    Client.PresentationConnector.ServerToClientCallbacks.SetTurn.call
                    (
                        Client.PresentationConnector.Callers.Client,
                        params.get("T")
                    );

                    const topOcc = game.TopOccFromFieldString(params.get("F"));
                    const bottomOcc = game.BottomOccFromFieldString(params.get("F"));

                    for (let i = 0; i < 16; i++)
                    {
                        Client.PresentationConnector.ServerToClientCallbacks.SetOccupation.call
                        (
                            Client.PresentationConnector.Callers.Client,
                            "top",
                            i,
                            topOcc[i]
                        );

                        Client.PresentationConnector.ServerToClientCallbacks.SetOccupation.call
                        (
                            Client.PresentationConnector.Callers.Client,
                            "bottom",
                            i,
                            bottomOcc[i]
                        );
                    }

                    break;

                case "reverse":
                    Client.PresentationConnector.ServerToClientCallbacks.Reverse.call
                    (
                        Client.PresentationConnector.Callers.Client,
                        parseInt(params.get("S"))
                    );

                    break;

                case "over":
                    Client.PresentationConnector.ServerToClientCallbacks.GameOver.call
                    (
                        Client.PresentationConnector.Callers.Client,
                        params.get("W")
                    );

                    break;
            }

            break;
    }
}

export function SendMessage(msg)
{
    Client.serverWebsocket.send(msg);
}

export function OnlineSessionStart(side, stepTime, opponent, fieldString, currentTurn)
{
    Client.OnlineGameStart(side, stepTime, opponent, fieldString, currentTurn);
}

export function SendMove(index, side)
{
    SendMessage("MI" + index.toString() + "?S" + (side === "bottom" ? "B" : "T") + "?");
}