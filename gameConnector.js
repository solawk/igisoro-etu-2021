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
            SetOccupation: null,
            AddTransfer: null,
            Reverse: null,
            SetTurn: null,
            GameOver: null,
        };

    this.ClientToServerCallbacks =
        {
            StartMove: null,
        };
}

GameConnector.prototype.Dummy = function()
{
    this.ServerToClientCallbacks.SetOccupation = function() {};
    this.ServerToClientCallbacks.AddTransfer = function() {};
    this.ServerToClientCallbacks.Reverse = function() {};
    this.ServerToClientCallbacks.SetTurn = function() {};
    this.ServerToClientCallbacks.GameOver = function() {};

    this.ClientToServerCallbacks.StartMove = function() {};
}