import {
    SetReverse
} from "./rendering.js";

export let Data;

export function Start(side, stepTime, redrawRoutine, transferRoutine)
{
    Data = {
        topOccupations: [],
        bottomOccupations: [],
        handOccupation: 0,
        state: "idle",
        turn: side,
        pit: -1,
        startPit: -1,
        stepTime: stepTime,
        redrawRoutine: redrawRoutine,
        transferRoutine: transferRoutine,
    };

    for (let i = 0; i < 8; i++)
    {
        Data.topOccupations[i] = 4;
        Data.bottomOccupations[i] = 4;

        Data.topOccupations[i + 8] = 0;
        Data.bottomOccupations[i + 8] = 0;
    }

    // TEST
    /*
    for (let i = 0; i < 8; i++)
    {
        Data.topOccupations[i] = 0;
        Data.bottomOccupations[i] = 0;

        Data.topOccupations[i + 8] = 0;
        Data.bottomOccupations[i + 8] = 0;
    }

    Data.topOccupations[1] = 15;
    Data.topOccupations[6] = 4;
    Data.topOccupations[8] = 6;
    Data.topOccupations[15] = 13;

    Data.topOccupations[2] = 1;
    Data.bottomOccupations[5] = 1;
    Data.bottomOccupations[10] = 1;
    */
    // TEST
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

        Data.startPit = index;

        if (CheckReversible(side, index))
        {
            SetToReversibleIdle(index);
            SetReverse(index);
            return "waitForReverse";
        }
        else
        {
            SetToGrab(index);
            MakeStep();
            return "grabOk";
        }
    }

    if (Data.state === "reversibleIdle")
    {
        let reverseIndexes = GetReverseIndexes(Data.pit);

        if (index === reverseIndexes[0])
        {
            SetToReverseGrab(Data.pit);
            SetReverse(-1);
            MakeStep();
            return "reverseOk";
        }

        if (index === reverseIndexes[1])
        {
            SetToGrab(Data.pit);
            SetReverse(-1);
            MakeStep();
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

function DecOccupation(side) // Decrease the hand's occupation by 1
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

function PrevPit() // Select the previous pit
{
    Data.pit--;
    if (Data.pit < 0)
    {
        Data.pit = 15;
    }
}

function StartPit() // Select the starting pit
{
    Data.pit = Data.startPit;
}

function SetToGrab(index) // Set the step state to grabbing from the indexed pit
{
    Data.pit = index;
    Data.state = "grab";
}

function SetToReversibleIdle(index) // Set the step state to waiting for reverse (or not)
{
    Data.pit = index;
    Data.state = "reversibleIdle";
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

    if (CheckGameOver())
    {
        console.log("Game over for the " + Data.turn + "!");
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

            Data.transferRoutine(pitOccupation, Data.turn, Data.pit, "hand", 0);
            Data.redrawRoutine();

            Data.state = "put";

            NextPit();

            PrepareNextStep();

            break;
        }

        case "put":
        {
            IncOccupation(Data.turn, Data.pit);
            DecOccupation("hand");

            Data.transferRoutine(1, "hand", 0, Data.turn, Data.pit);
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

            if (CheckReversible())
            {
                SetReverse(Data.pit);
                SetToReversibleIdle(Data.pit);

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

            Data.transferRoutine(GetOccupation(GetOtherSide(), opposings[0]), GetOtherSide(), opposings[0], "hand", 0);
            Data.transferRoutine(GetOccupation(GetOtherSide(), opposings[1]), GetOtherSide(), opposings[1], "hand", 0);

            SetOccupation(GetOtherSide(), opposings[0], 0);
            SetOccupation(GetOtherSide(), opposings[1], 0);
            SetOccupation("hand", 0, capturedAmount);

            Data.redrawRoutine();

            Data.state = "put";

            StartPit();
            NextPit();

            PrepareNextStep();

            break;
        }

        case "reverseGrab":
        {
            let pitOccupation = GetOccupation(Data.turn, Data.pit);

            SetOccupation("hand", 0, pitOccupation);
            SetOccupation(Data.turn, Data.pit, 0);

            Data.transferRoutine(pitOccupation, Data.turn, Data.pit, "hand", 0);
            Data.redrawRoutine();

            Data.state = "reversePut";

            PrevPit();

            PrepareNextStep();

            break;
        }

        case "reversePut":
        {
            IncOccupation(Data.turn, Data.pit);
            DecOccupation("hand", 0);

            Data.transferRoutine(1, "hand", 0, Data.turn, Data.pit);
            Data.redrawRoutine();

            if (GetOccupation("hand", 0) === 0)
            {
                Data.state = "end";
            }
            else
            {
                PrevPit();
            }

            PrepareNextStep();

            break;
        }
    }
}

function CheckCapture(pit = Data.pit, reverseLoops = 0, reverseBonus = 0)
{
    if (pit > 7) return false; // Cannot capture from the outer row

    let pitOccupation = GetOccupation(Data.turn, pit);
    if (pitOccupation < 2 - reverseBonus - reverseLoops) return false; // Cannot capture from an empty pit

    let opposings = GetOpposingIndexes(pit);
    if (GetOccupation(GetOtherSide(), opposings[0]) === 0 || GetOccupation(GetOtherSide(), opposings[1]) === 0) return false; // Cannot capture empty pits

    return true; // Otherwise we can capture
}

function CheckReversible(side= Data.turn, index = Data.pit)
{
    if (index !== 1 && index !== 6 && index !== 8 && index !== 15) return false;

    let pitOccupation = GetOccupation(side, index);

    if (pitOccupation < 2) return false;

    let loops = 0;
    while (pitOccupation > 15)
    {
        pitOccupation -= 16;
        loops++;
    }

    let indexWhereReverseEnds = index - pitOccupation;
    if (indexWhereReverseEnds < 0) indexWhereReverseEnds += 16;

    return CheckCapture(indexWhereReverseEnds, loops, 1);
}

function CheckGameOver()
{
    if (Data.turn === "bottom")
    {
        for (let i = 0; i < 16; i++)
        {
            if (Data.bottomOccupations[i] > 1)
            {
                return false;
            }
        }
    }
    else
    {
        for (let i = 0; i < 16; i++)
        {
            if (Data.topOccupations[i] > 1)
            {
                return false;
            }
        }
    }

    return true;
}