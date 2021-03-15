import {
    SetReverse
} from "./rendering.js";

export let Game;
export let Session;

export function Start(side, stepTime, redrawRoutine, transferRoutine)
{
    Game = {
        topOccupations: [],
        bottomOccupations: [],
        handOccupation: 0,
        state: "Idle",
        turn: side,
        pit: -1,
        sowPit: -1
    };

    Session = {
        stepTime: stepTime,
        redrawRoutine: redrawRoutine,
        transferRoutine: transferRoutine
    };

    for (let i = 0; i < 8; i++)
    {
        Game.topOccupations[i] = 4;
        Game.bottomOccupations[i] = 4;

        Game.topOccupations[i + 8] = 0;
        Game.bottomOccupations[i + 8] = 0;
    }

    // TEST
/*
        for (let i = 0; i < 8; i++)
        {
            Game.topOccupations[i] = 0;
            Game.bottomOccupations[i] = 0;

            Game.topOccupations[i + 8] = 0;
            Game.bottomOccupations[i + 8] = 0;
        }

        Game.bottomOccupations[0] = 2;
        Game.bottomOccupations[2] = 1;
        Game.bottomOccupations[6] = 1;

        Game.topOccupations[5] = 3;
        Game.topOccupations[10] = 3;
        Game.topOccupations[4] = 1;
        Game.topOccupations[11] = 1;
        Game.topOccupations[3] = 2;
        Game.topOccupations[12] = 1;
*/
    // TEST
}

export function CheckMove(side, index)
{
    MakeStep(index, side);
}

export function GetReverseIndexes(index) // Get the indexes of pits that will contain the reverse choice arrows
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

export function GetOpposingIndexes(index)
{
    return [7 - index, 8 + index];
}

export function GetOccupation(currentState, side, index) // Get a pit's or the hand's occupation
{
    if (side === "bottom")
    {
        return currentState.bottomOccupations[index];
    }

    if (side === "top")
    {
        return currentState.topOccupations[index];
    }

    if (side === "hand")
    {
        return currentState.handOccupation;
    }
}

export function SetOccupation(currentState, side, index, occupation) // Set a pit's or the hand's occupation
{
    if (side === "bottom")
    {
        currentState.bottomOccupations[index] = occupation;
    }

    if (side === "top")
    {
        currentState.topOccupations[index] = occupation;
    }

    if (side === "hand")
    {
        currentState.handOccupation = occupation;
    }
}

export function IncOccupation(currentState, side, index, amount = 1) // Increase a pit's occupation
{
    if (side === "bottom")
    {
        currentState.bottomOccupations[index] += amount;
    }

    if (side === "top")
    {
        currentState.topOccupations[index] += amount;
    }
}

export function DecOccupation(currentState, side) // Decrease the hand's occupation by 1
{
    if (side === "hand")
    {
        currentState.handOccupation--;
    }
}

export function NextPit(currentState) // Select the next pit
{
    currentState.pit = (currentState.pit + 1) % 16;
}

export function PrevPit(currentState) // Select the previous pit
{
    currentState.pit = (currentState.pit - 1) % 16;
}

export function SowPit(currentState) // Select the sowing pit
{
    currentState.pit = currentState.sowPit;
}

export function GetOtherSide(currentState) // Get the opposing side' string
{
    if (currentState.turn === "top")
    {
        return "bottom";
    }
    else
    {
        return "top";
    }
}

function SetState(newState)
{
    console.log("State set to " + newState)
    Game.state = newState;
}

function MakeStep(clickedPit, clickedSide) // Making the step
{
    switch (Game.state)
    {
        case "Idle":
        {
            actionIdle(clickedPit, clickedSide);
            break;
        }

        case "ReverseIdle":
        {
            actionReverseIdle(clickedPit, clickedSide);
            break;
        }

        case "SideCheck":
        {
            actionSideCheck(clickedPit, clickedSide);
            break;
        }

        case "OccupationCheck":
        {
            actionOccupationCheck(clickedPit, clickedSide);
            break;
        }

        case "ReverseCheck":
        {
            actionReverseCheck();
            break;
        }

        case "CaptureCheck":
        {
            actionCaptureCheck();
            break;
        }

        case "Capture":
        {
            actionCapture();
            break;
        }

        case "Grab":
        {
            actionGrab("f");
            break;
        }

        case "Put":
        {
            actionPut("f");
            break;
        }

        case "ReverseGrab":
        {
            actionGrab("b");
            break;
        }

        case "ReversePut":
        {
            actionPut("b");
            break;
        }

        case "PutEnd":
        {
            actionPutEnd();
            break;
        }

        case "End":
        {
            actionEnd();
            break;
        }
    }
}

function MakeStepDelayed()
{
    setTimeout(function()
    {
        MakeStep()
    }, Session.stepTime);
}

// Player is initiating a turn
function actionIdle(clickedPit, clickedSide)
{
    SetState("SideCheck");
    MakeStep(clickedPit, clickedSide);
}

// Game is checking if the pit clicked is on the right side
function actionSideCheck(clickedPit, clickedSide)
{
    if (clickedSide === Game.turn)
    {
        // Side is correct
        console.log("Side is correct");

        SetState("OccupationCheck");
        MakeStep(clickedPit, clickedSide);
    }
    else
    {
        // Side is incorrect
        console.log("Side is incorrect: " + clickedSide + " vs " + Game.turn + " now");

        SetState("Idle");
    }
}

// Game is checking if the pit clicked has enough seeds
function actionOccupationCheck(clickedPit, clickedSide)
{
    let pitOccupation;

    if (clickedSide === "bottom")
    {
        pitOccupation = Game.bottomOccupations[clickedPit];
    }
    else
    {
        pitOccupation = Game.topOccupations[clickedPit];
    }

    if (pitOccupation > 1)
    {
        // There are enough seeds to make a move
        console.log("Enough seeds to make a move");

        SetState("ReverseCheck");
        Game.sowPit = clickedPit;
        Game.pit = clickedPit;

        MakeStep();
    }
    else
    {
        // There aren't
        console.log("Not enough seeds to make a move");

        SetState("Idle");
    }
}

// Game is checking if it's possible to make a reverse move from the pit
function actionReverseCheck()
{
    if (CheckReversible(Game, Game.turn, Game.pit))
    {
        // We request an input for the possible reverse move
        console.log("Reversible");

        SetState("ReverseIdle");
        SetReverse(Game.pit);
        MakeStep();
    }
    else
    {
        // Cannot reverse, hence doing a regular move
        console.log("Not reversible");

        SetState("Grab");
        MakeStep();
    }
}

function actionReverseIdle(clickedPit)
{
    let reverseIndexes = GetReverseIndexes(Game.pit);

    if (clickedPit === reverseIndexes[0])
    {
        SetState("ReverseGrab");
        SetReverse(-1);

        Game.sowPit = Game.pit;

        MakeStep();
    }

    if (clickedPit === reverseIndexes[1])
    {
        SetState("Grab");
        SetReverse(-1);

        MakeStep();
    }
}

function actionCaptureCheck()
{
    if (CheckCapture(Game, Game.pit))
    {
        console.log("Can capture");

        SetState("Capture");
        MakeStepDelayed();
    }
    else
    {
        console.log("Cannot capture");

        SetState("ReverseCheck");
        MakeStep();
    }
}

function actionCapture()
{
    let opposings = GetOpposingIndexes(Game.pit);
    let capturedFromFirst = GetOccupation(Game, GetOtherSide(Game), opposings[0]);
    let capturedFromSecond = GetOccupation(Game, GetOtherSide(Game), opposings[1]);
    let capturedAmount = capturedFromFirst + capturedFromSecond;

    console.log("Capturing " + capturedFromFirst + " from " + opposings[0] + " and " + capturedFromSecond + " from " + opposings[1]
    + " into " + Game.sowPit);

    SetOccupation(Game, GetOtherSide(Game), opposings[0], 0);
    SetOccupation(Game, GetOtherSide(Game), opposings[1], 0);
    IncOccupation(Game, Game.turn, Game.sowPit, capturedAmount);

    if (CheckReversible(Game, Game.turn, Game.sowPit))
    {
        // Can reverse after capture
        console.log("Can reverse after this capture");

        Session.transferRoutine(capturedFromFirst, GetOtherSide(Game), opposings[0], Game.turn, Game.sowPit);
        Session.transferRoutine(capturedFromSecond, GetOtherSide(Game), opposings[1], Game.turn, Game.sowPit);

        SowPit(Game);

        SetState("ReverseCheck");
    }
    else
    {
        // Cannot reverse after capture
        console.log("Cannot reverse after this capture");

        Session.transferRoutine(capturedFromFirst, GetOtherSide(Game), opposings[0], "hand", 0);
        Session.transferRoutine(capturedFromSecond, GetOtherSide(Game), opposings[1], "hand", 0);

        SetOccupation(Game, Game.turn, Game.sowPit, 0);
        SetOccupation(Game, "hand", 0, capturedAmount);

        SowPit(Game);
        NextPit(Game);

        SetState("Put");
    }

    Session.redrawRoutine();
    MakeStepDelayed(Game);
}

function actionGrab(direction)
{
    let pitOccupation = GetOccupation(Game, Game.turn, Game.pit);

    SetOccupation(Game, "hand", 0, pitOccupation);
    SetOccupation(Game, Game.turn, Game.pit, 0);

    Session.transferRoutine(pitOccupation, Game.turn, Game.pit, "hand", 0);
    Session.redrawRoutine();

    if (direction === "f")
    {
        NextPit(Game);
        SetState("Put");
    }
    else
    {
        PrevPit(Game);
        SetState("ReversePut");
    }

    MakeStepDelayed();
}

function actionPut(direction)
{
    IncOccupation(Game, Game.turn, Game.pit);
    DecOccupation(Game, "hand");

    Session.transferRoutine(1, "hand", 0, Game.turn, Game.pit);
    Session.redrawRoutine();

    if (GetOccupation(Game, "hand", 0) === 0)
    {
        SetState("PutEnd");
    }
    else
    {
        if (direction === "f")
        {
            NextPit(Game);
        }
        else
        {
            PrevPit(Game);
        }
    }

    MakeStepDelayed();
}

function actionPutEnd()
{
    if (GetOccupation(Game, Game.turn, Game.pit) > 1)
    {
        SetState("CaptureCheck")
        MakeStepDelayed();
    }
    else
    {
        SetState("End");
        MakeStep();
    }
}

function actionEnd()
{
    Game.pit = -1;
    Game.sowPit = -1;

    if (Game.turn === "top")
    {
        Game.turn = "bottom";
    }
    else
    {
        Game.turn = "top";
    }

    SetState("Idle");
    Session.redrawRoutine();
}

export function CheckCapture(currentState, pit, reverseLoops = 0, reverseBonus = 0)
{
    if (pit > 7) return false; // Cannot capture from the outer row

    let pitOccupation = GetOccupation(currentState, currentState.turn, pit);
    if (pitOccupation < 2 - reverseBonus - reverseLoops) return false; // Cannot capture from an empty pit

    let opposings = GetOpposingIndexes(pit);
    if (GetOccupation(currentState, GetOtherSide(currentState), opposings[0]) === 0
        || GetOccupation(currentState, GetOtherSide(currentState), opposings[1]) === 0) return false; // Cannot capture empty pits

    return true; // Otherwise we can capture
}

export function CheckReversible(currentState, side, index)
{
    if (index !== 1 && index !== 6 && index !== 8 && index !== 15) return false;

    let pitOccupation = GetOccupation(currentState, side, index);

    if (pitOccupation < 2) return false;

    let loops = 0;
    while (pitOccupation > 15)
    {
        pitOccupation -= 16;
        loops++;
    }

    let indexWhereReverseEnds = index - pitOccupation;
    if (indexWhereReverseEnds < 0) indexWhereReverseEnds += 16;

    return CheckCapture(currentState, indexWhereReverseEnds, loops, 1);
}

export function CheckGameOver(currentState)
{
    if (currentState.turn === "bottom")
    {
        for (let i = 0; i < 16; i++)
        {
            if (currentState.bottomOccupations[i] > 1)
            {
                return false;
            }
        }
    }
    else
    {
        for (let i = 0; i < 16; i++)
        {
            if (currentState.topOccupations[i] > 1)
            {
                return false;
            }
        }
    }

    return true;
}