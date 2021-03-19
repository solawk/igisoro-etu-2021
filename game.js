export function Start(side, stepTime, field, LogicConnector)
{
    return new Game(side, stepTime, field, LogicConnector);
}

function Game(side, stepTime, field, Connector)
{
    this.Connector = Connector;

    this.SetGame(field, side, stepTime);
}

Game.prototype.CheckMove = function(index, side)
{
    if (this.state !== "Idle" && this.state !== "ReverseIdle")
    {
        console.log("Turn in progress!");
        return;
    }

    this.MakeStep(index, side);
}

Game.prototype.DispatchMove = function(index, side, isDelayed)
{
    const delay = isDelayed ? this.stepTime * 100 : 0;

    let me = this;
    setTimeout(function()
        {
            me.MakeStep(index, side);
        },
        delay)
}

function GetReverseIndexes(index) // Get the indexes of pits that will contain the reverse choice arrows
{
    if (index === 1)
    {
        return [0, 2];
    }

    if (index === 6)
    {
        return [5, 7];
    }

    if (index === 8)
    {
        return [7, 9];
    }

    if (index === 15)
    {
        return [14, 0];
    }
}

function GetOpposingIndexes(index)
{
    return [7 - index, 8 + index];
}

Game.prototype.GetOccupation = function(side, index) // Get a pit's or the hand's occupation
{
    if (side === "bottom")
    {
        return this.bottomOccupations[index];
    }

    if (side === "top")
    {
        return this.topOccupations[index];
    }

    if (side === "hand")
    {
        return this.handOccupation;
    }
}

Game.prototype.SetOccupation = function(side, index, occupation) // Set a pit's or the hand's occupation
{
    if (side === "bottom")
    {
        this.bottomOccupations[index] = occupation;
    }

    if (side === "top")
    {
        this.topOccupations[index] = occupation;
    }

    if (side === "hand")
    {
        this.handOccupation = occupation;
    }

    this.Connector.OutputCallbacks.SetOccupation.call(this.Connector.Callers.GameScene, side, index, occupation);
}

Game.prototype.DeltaOccupation = function(side, index, amount) // Modify a pit's occupation by amount
{
    this.SetOccupation(side, index, this.GetOccupation(side, index) + amount);
}

Game.prototype.CreateTransfer = function(count, oSide, oIndex, dSide, dIndex)
{
    this.Connector.OutputCallbacks.AddTransfer.call(this.Connector.Callers.GameScene, count, oSide, oIndex, dSide, dIndex);
}

Game.prototype.SwitchTurn = function()
{
    this.turn = this.GetOtherSide();

    this.Connector.OutputCallbacks.SetTurn.call(this.Connector.Callers.GameScene, this.turn);
}

Game.prototype.NextPit = function() // Select the next pit
{
    this.pit = (this.pit + 1) % 16;
}

Game.prototype.PrevPit = function() // Select the previous pit
{
    this.pit = (this.pit + 15) % 16;
}

Game.prototype.ChooseSowPit = function() // Select the sowing pit
{
    this.pit = this.sowPit;
}

Game.prototype.GetOtherSide = function() // Get the opposing side' string
{
    if (this.turn === "top")
    {
        return "bottom";
    }
    else
    {
        return "top";
    }
}

Game.prototype.SetState = function(newState)
{
    this.state = newState;
}

Game.prototype.MakeStep = function(clickedPit, clickedSide) // Making the step
{
    switch (this.state)
    {
        case "Idle":
        {
            return this.actionIdle(clickedPit, clickedSide);
        }

        case "ReverseIdle":
        {
            return this.actionReverseIdle(clickedPit, clickedSide);
        }

        case "SideCheck":
        {
            return this.actionSideCheck(clickedPit, clickedSide);
        }

        case "OccupationCheck":
        {
            return this.actionOccupationCheck(clickedPit, clickedSide);
        }

        case "ReverseCheck":
        {
            return this.actionReverseCheck();
        }

        case "CaptureCheck":
        {
            return this.actionCaptureCheck();
        }

        case "Capture":
        {
            return this.actionCapture();
        }

        case "Grab":
        {
            return this.actionGrab("f");
        }

        case "Put":
        {
            return this.actionPut("f");
        }

        case "ReverseGrab":
        {
            return this.actionGrab("b");
        }

        case "ReversePut":
        {
            return this.actionPut("b");
        }

        case "PutEnd":
        {
            return this.actionPutEnd();
        }

        case "End":
        {
            return this.actionEnd();
        }
    }
}

// Player is initiating a turn
Game.prototype.actionIdle = function(clickedPit, clickedSide)
{
    console.log("CLICK on " + clickedPit);
    this.SetState("SideCheck");

    this.DispatchMove(clickedPit, clickedSide, false);
}

// Game is checking if the pit clicked is on the right side
Game.prototype.actionSideCheck = function(clickedPit, clickedSide)
{
    if (clickedSide === this.turn)
    {
        // Side is correct
        console.log("SIDE ok");

        this.SetState("OccupationCheck");
        this.DispatchMove(clickedPit, clickedSide, false);
    }
    else
    {
        // Side is incorrect
        console.log("SIDE fail");

        this.SetState("Idle");
    }
}

// Game is checking if the pit clicked has enough seeds
Game.prototype.actionOccupationCheck = function(clickedPit, clickedSide)
{
    let pitOccupation;

    if (clickedSide === "bottom")
    {
        pitOccupation = this.bottomOccupations[clickedPit];
    }
    else
    {
        pitOccupation = this.topOccupations[clickedPit];
    }

    if (pitOccupation > 1)
    {
        // There are enough seeds to make a move
        console.log("OCCUPATION ok");

        this.SetState("ReverseCheck");
        this.sowPit = clickedPit;
        this.pit = clickedPit;

        this.DispatchMove(clickedPit, clickedSide, false);
    }
    else
    {
        // There aren't
        console.log("OCCUPATION fail");

        this.SetState("Idle");
    }
}

// Game is checking if it's possible to make a reverse move from the pit
Game.prototype.actionReverseCheck = function()
{
    if (this.CheckReversible(this.turn, this.pit))
    {
        // We request an input for the possible reverse move
        console.log("REVERSIBLE true");

        this.SetState("ReverseIdle");
        this.Connector.OutputCallbacks.Reverse.call(this.Connector.Callers.GameScene, this.pit);
    }
    else
    {
        // Cannot reverse, hence doing a regular move
        console.log("REVERSIBLE false");

        this.SetState("Grab");
    }

    this.DispatchMove(null, null, false);
}

Game.prototype.actionReverseIdle = function(clickedPit)
{
    let reverseIndexes = GetReverseIndexes(this.pit);

    if (clickedPit === reverseIndexes[0])
    {
        console.log("REVERSE true");
        this.SetState("ReverseGrab");
        this.Connector.OutputCallbacks.Reverse.call(this.Connector.Callers.GameScene, -1);

        this.sowPit = this.pit;

        this.DispatchMove(null, null, false);
    }

    if (clickedPit === reverseIndexes[1])
    {
        console.log("REVERSE false");
        this.SetState("Grab");
        this.Connector.OutputCallbacks.Reverse.call(this.Connector.Callers.GameScene, -1);

        this.DispatchMove(null, null, false);
    }
}

Game.prototype.actionCaptureCheck = function()
{
    if (this.CheckCapture(this.pit))
    {
        console.log("CAPTURE true");

        this.SetState("Capture");
        this.DispatchMove(null, null, true);
    }
    else
    {
        console.log("CAPTURE false");

        this.SetState("ReverseCheck");
        this.DispatchMove(null, null, false);
    }
}

Game.prototype.actionCapture = function()
{
    let opposings = GetOpposingIndexes(this.pit);
    let capturedFromFirst = this.GetOccupation(this.GetOtherSide(), opposings[0]);
    let capturedFromSecond = this.GetOccupation(this.GetOtherSide(), opposings[1]);
    let capturedAmount = capturedFromFirst + capturedFromSecond;

    console.log("CAPTURING " + capturedFromFirst + " from " + opposings[0] + " + " + capturedFromSecond + " from " + opposings[1]
        + " into " + this.sowPit);

    this.SetOccupation(this.GetOtherSide(), opposings[0], 0);
    this.SetOccupation(this.GetOtherSide(), opposings[1], 0);
    this.DeltaOccupation(this.turn, this.sowPit, capturedAmount);

    if (this.CheckReversible(this.turn, this.sowPit))
    {
        // Can reverse after capture
        console.log("REVERSIBLE AFTER CAPTURE true");

        this.CreateTransfer(capturedFromFirst, this.GetOtherSide(), opposings[0], this.turn, this.sowPit);
        this.CreateTransfer(capturedFromSecond, this.GetOtherSide(), opposings[1], this.turn, this.sowPit);

        this.ChooseSowPit();

        this.SetState("ReverseCheck");
    }
    else
    {
        // Cannot reverse after capture
        console.log("REVERSIBLE AFTER CAPTURE false");

        this.CreateTransfer(capturedFromFirst, this.GetOtherSide(), opposings[0], "hand", 0);
        this.CreateTransfer(capturedFromSecond, this.GetOtherSide(), opposings[1], "hand", 0);

        this.SetOccupation(this.turn, this.sowPit, 0);
        this.SetOccupation("hand", 0, capturedAmount);

        this.ChooseSowPit();
        this.NextPit();

        this.SetState("Put");
    }

    this.DispatchMove(null, null, true);
}

Game.prototype.actionGrab = function(direction)
{
    console.log("GRAB from " + this.pit);
    this.sowPit = this.pit;

    let pitOccupation = this.GetOccupation(this.turn, this.pit);

    this.SetOccupation("hand", 0, pitOccupation);
    this.SetOccupation(this.turn, this.pit, 0);

    this.CreateTransfer(pitOccupation, this.turn, this.pit, "hand", 0);

    if (direction === "f")
    {
        this.NextPit();
        this.SetState("Put");
    }
    else
    {
        this.PrevPit();
        this.SetState("ReversePut");
    }

    this.DispatchMove(null, null, true);
}

Game.prototype.actionPut = function(direction)
{
    console.log("PUT into " + this.pit);

    this.DeltaOccupation(this.turn, this.pit, 1);
    this.DeltaOccupation("hand", 0, -1);

    this.CreateTransfer(1, "hand", 0, this.turn, this.pit);

    if (this.GetOccupation("hand", 0) === 0)
    {
        this.SetState("PutEnd");
    }
    else
    {
        if (direction === "f")
        {
            this.NextPit();
        }
        else
        {
            this.PrevPit();
        }
    }

    this.DispatchMove(null, null, true);
}

Game.prototype.actionPutEnd = function()
{
    console.log("PUT END in " + this.pit);

    if (this.GetOccupation(this.turn, this.pit) > 1)
    {
        console.log("CAN CONTINUE true");
        this.SetState("CaptureCheck")
        this.DispatchMove(null, null, true);
    }
    else
    {
        console.log("CAN CONTINUE false");
        this.SetState("End");
        this.DispatchMove(null, null, false);
    }
}

Game.prototype.actionEnd = function()
{
    console.log("END");
    this.pit = -1;
    this.sowPit = -1;

    this.SwitchTurn();

    this.SetState("Idle");
}

Game.prototype.CheckCapture = function(pit, reverseLoops = 0, reverseBonus = 0)
{
    if (pit > 7) return false; // Cannot capture from the outer row

    let pitOccupation = this.GetOccupation(this.turn, pit);
    if (pitOccupation < 2 - reverseBonus - reverseLoops) return false; // Cannot capture from an empty pit

    let opposings = GetOpposingIndexes(pit);
    if (this.GetOccupation(this.GetOtherSide(), opposings[0]) === 0
        || this.GetOccupation(this.GetOtherSide(), opposings[1]) === 0) return false; // Cannot capture empty pits

    return true; // Otherwise we can capture
}

Game.prototype.CheckReversible = function(side, index)
{
    if (index !== 1 && index !== 6 && index !== 8 && index !== 15) return false;

    let pitOccupation = this.GetOccupation(side, index);

    if (pitOccupation < 2) return false;

    let loops = 0;
    while (pitOccupation > 15)
    {
        pitOccupation -= 16;
        loops++;
    }

    let indexWhereReverseEnds = index - pitOccupation;
    if (indexWhereReverseEnds < 0) indexWhereReverseEnds += 16;

    return this.CheckCapture(indexWhereReverseEnds, loops, 1);
}

Game.prototype.CheckGameOver = function()
{
    if (this.turn === "bottom")
    {
        for (let i = 0; i < 16; i++)
        {
            if (this.bottomOccupations[i] > 1)
            {
                return false;
            }
        }
    }
    else
    {
        for (let i = 0; i < 16; i++)
        {
            if (this.topOccupations[i] > 1)
            {
                return false;
            }
        }
    }

    return true;
}

Game.prototype.SetGame = function(field, side, stepTime)
{
    this.topOccupations = [];
    this.bottomOccupations = [];
    this.handOccupation = 0;
    this.state = "Idle";
    this.turn = side;
    this.pit = -1;
    this.sowPit = -1;
    this.stepTime = stepTime;

    this.LoadPitOccupation(field);
}

Game.prototype.LoadPitOccupation = function(field)
{
    for (let i = 0; i < 16; i++)
    {
        this.topOccupations[i] = field.topOccupations[i];
        this.bottomOccupations[i] = field.bottomOccupations[i];
    }

    this.hand = 0;
}