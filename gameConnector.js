export function GameConnector()
{
    this.Callers =
        {
            Game: null,
            GameTable: null,
        };

    this.InputCallbacks =
        {
            StartMove: null,
            SetOccupation: null,
            AddTransfer: null,
            Reverse: null,
            SetTurn: null,
        };

    this.OutputCallbacks =
        {
            StartMove: null,
            SetOccupation: null,
            AddTransfer: null,
            Reverse: null,
            SetTurn: null,
        };
}