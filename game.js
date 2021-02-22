function nullRedraw()
{
    console.log("Redraw not handled warning!");
}

export let Data =
    {
        topOccupations: [],
        bottomOccupations: [],
        handOccupation: 0,
        state: "idle",
        turn: "idle",
        pit: -1,
        stepTime: 300,
        redrawRoutine: nullRedraw
    }

export function Start(side, stepTime, redrawRoutine)
{
    Data.topOccupations = [];
    Data.bottomOccupations = [];

    for (let i = 0; i < 8; i++)
    {
        Data.topOccupations[i] = 4;
        Data.bottomOccupations[i] = 4;

        Data.topOccupations[i + 8] = 0;
        Data.bottomOccupations[i + 8] = 0;
    }

    Data.state = "idle";
    Data.turn = side;
    Data.pit = -1;

    Data.stepTime = stepTime;
    Data.redrawRoutine = redrawRoutine;
}

export function CheckMove(side, index)
{
    if (side !== Data.turn)
    {
        return "wrongSide";
    }

    if (Data.state === "idle")
    {
        let pitOccupation;

        if (side === "bottom")
        {
            pitOccupation = Data.bottomOccupations[index];
        }
        else
        {
            pitOccupation = Data.topOccupations[index];
        }

        if (pitOccupation < 2)
        {
            return "notEnough";
        }

        SetToGrab(index);
        MakeStep();
        return "grabOk";
    }

    if (Data.state === "reversibleIdle")
    {
        let reverseIndexes = GetReverseIndexes(Data.pit);

        if (index === reverseIndexes[0])
        {
            return "reverseOk";
        }

        if (index === reverseIndexes[1])
        {
            return "grabOk";
        }
    }

    return "inProgress";
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

function GetOccupation(side, index) // Get a pit's or the hand's occupation
{
    if (side === "bottom")
    {
        return Data.bottomOccupations[index];
    }

    if (side === "top")
    {
        return Data.topOccupations[index];
    }

    if (side === "hand")
    {
        return Data.handOccupation;
    }
}

function SetOccupation(side, index, occupation) // Set a pit's or the hand's occupation
{
    if (side === "bottom")
    {
        Data.bottomOccupations[index] = occupation;
    }

    if (side === "top")
    {
        Data.topOccupations[index] = occupation;
    }

    if (side === "hand")
    {
        Data.handOccupation = occupation;
    }
}

function IncOccupation(side, index) // Increase a pit's occupation by 1
{
    if (side === "bottom")
    {
        Data.bottomOccupations[index]++;
    }

    if (side === "top")
    {
        Data.topOccupations[index]++;
    }
}

function DecOccupation(side, index) // Decrease the hand's occupation by 1
{
    if (side === "hand")
    {
        Data.handOccupation--;
    }
}

function NextPit() // Select the next pit
{
    Data.pit++;
    if (Data.pit > 15)
    {
        Data.pit = 0;
    }
}

function SetToGrab(index) // Set the step state to grabbing from the indexed pit
{
    Data.pit = index;
    Data.state = "grab";
}

function SetToReverseGrab(index) // Set the step state to grabbing from the indexed pit before reversing
{
    Data.pit = index;
    Data.state = "reverseGrab";
}

function GetOtherSide() // Get the opposing side' string
{
    if (Data.turn === "top")
    {
        return "bottom";
    }
    else
    {
        return "top";
    }
}

function PrepareNextStep() // Start waiting for the next step
{
    setTimeout(function()
    {
        MakeStep()
    }, Data.stepTime);
}

function EndTurn() // Ready the turn for the other side
{
    Data.state = "idle";
    Data.pit = -1;

    if (Data.turn === "top")
    {
        Data.turn = "bottom";
    }
    else
    {
        Data.turn = "top";
    }
}

function MakeStep() // Making the step
{
    switch (Data.state)
    {
        case "grab":
        {
            let pitOccupation = GetOccupation(Data.turn, Data.pit);

            SetOccupation("hand", 0, pitOccupation);
            SetOccupation(Data.turn, Data.pit, 0);

            Data.redrawRoutine();

            Data.state = "put";

            NextPit();

            PrepareNextStep();

            break;
        }

        case "put":
        {
            IncOccupation(Data.turn, Data.pit);
            DecOccupation("hand", 0);

            Data.redrawRoutine();

            if (GetOccupation("hand", 0) === 0)
            {
                Data.state = "end";
            }
            else
            {
                NextPit();
            }

            PrepareNextStep();

            break;
        }

        case "end":
        {
            if (CheckCapture())
            {
                Data.state = "capture";
                PrepareNextStep();

                break;
            }

            if (GetOccupation(Data.turn, Data.pit) > 1)
            {
                Data.state = "grab";
                PrepareNextStep();
            }
            else
            {
                EndTurn();
            }

            Data.redrawRoutine();

            break;
        }

        case "capture":
        {
            let opposings = GetOpposingIndexes(Data.pit);
            let capturedAmount = GetOccupation(GetOtherSide(), opposings[0]) + GetOccupation(GetOtherSide(), opposings[1]);

            SetOccupation(GetOtherSide(), opposings[0], 0);
            SetOccupation(GetOtherSide(), opposings[1], 0);
            SetOccupation("hand", 0, capturedAmount);

            Data.redrawRoutine();

            Data.state = "put";

            NextPit();

            PrepareNextStep();

            break;
        }
    }
}

function CheckCapture(reverseLoops = 0, reverseBonus = 0)
{
    if (Data.pit > 7) return false; // Cannot capture from the outer row

    let pitOccupation = GetOccupation(Data.turn, Data.pit);
    if (pitOccupation < 2 - reverseBonus - reverseLoops) return false; // Cannot capture from an empty pit

    let opposings = GetOpposingIndexes(Data.pit);
    if (GetOccupation(GetOtherSide(), opposings[0]) === 0 || GetOccupation(GetOtherSide(), opposings[1]) === 0) return false; // Cannot capture empty pits

    return true; // Otherwise we can capture
}