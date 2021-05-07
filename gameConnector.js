(function(exports)
{

    exports.GameConnector = GameConnector;

})(typeof exports === 'undefined' ? this['gameConnector'] = {} : exports);

function GameConnector()
{
    this.Callers =
        {
            Server: null,
            Client: null,
        };

    this.ServerToClientCallbacks =
        {
            StartMove: null,
            SetOccupation: null,
            AddTransfer: null,
            Reverse: null,
            SetTurn: null,
            GameOver: null,
        };

    this.ClientToServerCallbacks =
        {
            StartMove: null,
            SetOccupation: null,
            AddTransfer: null,
            Reverse: null,
            SetTurn: null,
            GameOver: null,
        };
}