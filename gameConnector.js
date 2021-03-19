export function GameConnector()
{
    this.Callers =
        {
            Game: null,
            GameScene: null,
        };

    this.InputCallbacks =
        {
            CheckMove: null,
            SetOccupation: null,
            AddTransfer: null,
            Reverse: null,
            SetTurn: null,
        };

    this.OutputCallbacks =
        {
            CheckMove: null,
            SetOccupation: null,
            AddTransfer: null,
            Reverse: null,
            SetTurn: null,
        };
}