import * as Game from './game.js'

function SearchNode(parent, pit, state, score, depth)
{
    this.parent = parent;
    this.children = [];

    this.pit = pit;
    this.State = state;
    this.score = score;
    this.depth = depth;

    this.reversingPit = -1;
}

let NodesToUnwrap = [];
const depth = 5;

export function StartEvaluation(currentState)
{
    NodesToUnwrap = [];

    let rootState =
        {
            topOccupations: [],
            bottomOccupations: [],
            handOccupation: currentState.handOccupation,
            state: currentState.state,
            turn: currentState.turn,
            pit: currentState.pit,
            startPit: currentState.startPit
        };
    for (let i = 0; i < 16; i++)
    {
        rootState.topOccupations.push(currentState.topOccupations[i]);
        rootState.bottomOccupations.push(currentState.bottomOccupations[i]);
    }

    let rootNode = new SearchNode(null, -1, rootState, 0, 0);
    NodesToUnwrap.push(rootNode);

    for (let d = 0; d < depth; d++)
    {
        //console.log("Depth " + d);
        let UnwrapArrayLength = NodesToUnwrap.length;
        //console.log("Unwrap length " + UnwrapArrayLength);
        for (let i = 0; i < UnwrapArrayLength; i++)
        {
            //console.log(i);
            Unwrap(NodesToUnwrap[i]);
        }

        NodesToUnwrap.splice(0, UnwrapArrayLength);
    }

    console.log("Backtracks");
    DrawTree(rootNode);
}

function Unwrap(node)
{
    let occupations = node.State.turn === "bottom" ?
        node.State.bottomOccupations : node.State.topOccupations;

    if (node.reversingPit === -1) // Node is not being split into reverse and not-reverse
    {
        for (let i = 0; i < 16; i++)
        {
            if (occupations[i] < 2) continue;

            ArtificialCheckMove(node, i);
        }
    }
    else
    {
        ArtificialCheckMove(node, node.reversingPit);
    }
}

function ArtificialCheckMove(node, index)
{
    if (Game.CheckReversible(node.State, node.State.turn, index))
    {
        //console.log("reverse");

        if (node.reversingPit === -1)
        {
            ArtificialCreateChild(node, index, "end");
        }
        else
        {
            ArtificialCreateChild(node, index, "grab");
            ArtificialCreateChild(node, index, "reverseGrab");
        }
    }
    else
    {
        //console.log("normal");
        ArtificialCreateChild(node, index, "grab");
    }
}

function ArtificialCreateChild(node, pit, action)
{
    let newStartPit = node.reversingPit === -1 ? pit : node.State.startPit;

    let newState =
        {
            topOccupations: [],
            bottomOccupations: [],
            handOccupation: node.State.handOccupation,
            state: action,
            turn: node.State.turn,
            pit: pit,
            startPit: newStartPit
        };
    for (let i = 0; i < 16; i++)
    {
        newState.topOccupations.push(node.State.topOccupations[i]);
        newState.bottomOccupations.push(node.State.bottomOccupations[i]);
    }

    let newPit = node.reversingPit === -1 ? pit : (action === "grab" ? (pit + 1) % 16 : (pit - 1) % 16);
    let newScore = node.parent !== null ? node.score : 0;
    let newDepth = node.reversingPit === -1 ? node.depth + 1 : node.depth;

    let newNode = new SearchNode(node, newPit, newState, newScore, newDepth);
    node.children.push(newNode);

    let controlObject =
        {
            stop: false,
        };

    //console.log("In");
    while (controlObject.stop === false)
    {
        ArtificialMakeStep(newNode, controlObject);
    }
    //console.log("Out");

    NodesToUnwrap.push(newNode);
}

function ArtificialMakeStep(node, control)
{
    //console.log(
    //    " state: " + node.State.state +
    //    " hand: " + node.State.handOccupation
    //);
    let pitOccupation = Game.GetOccupation(node.State, node.State.turn, node.State.pit);

    switch (node.State.state)
    {
        case "grab":
        {
            Game.SetOccupation(node.State, "hand", 0, pitOccupation);
            Game.SetOccupation(node.State, node.State.turn, node.State.pit, 0);

            node.State.state = "put";

            Game.NextPit(node.State);

            break;
        }

        case "put":
        {
            Game.IncOccupation(node.State, node.State.turn, node.State.pit);
            Game.DecOccupation(node.State, "hand");

            if (Game.GetOccupation(node.State, "hand", 0) === 0)
            {
                node.State.state = "end";
            }
            else
            {
                Game.NextPit(node.State);
            }

            break;
        }

        case "end":
        {
            if (Game.CheckCapture(node.State, node.State.pit))
            {
                node.State.state = "capture";
            }

            else if (Game.CheckReversible(node.State, node.State.turn, node.State.pit))
            {
                node.reversingPit = node.State.pit;
                control.stop = true;
            }

            else
            {
                if (Game.GetOccupation(node.State, node.State.turn, node.State.pit) > 1)
                {
                    node.State.state = "grab";
                }
                else
                {
                    Game.EndTurn(node.State);
                    control.stop = true;
                }
            }

            break;
        }

        case "capture":
        {
            let opposings = Game.GetOpposingIndexes(node.State.pit);
            let capturedAmount = Game.GetOccupation(node.State, Game.GetOtherSide(node.State), opposings[0])
                + Game.GetOccupation(node.State, Game.GetOtherSide(node.State), opposings[1]);

            Game.SetOccupation(node.State, Game.GetOtherSide(node.State), opposings[0], 0);
            Game.SetOccupation(node.State, Game.GetOtherSide(node.State), opposings[1], 0);
            Game.SetOccupation(node.State, "hand", 0, capturedAmount);

            node.State.state = "put";

            Game.StartPit(node.State);
            Game.NextPit(node.State);

            node.score += capturedAmount;

            break;
        }

        case "reverseGrab":
        {
            Game.SetOccupation(node.State, "hand", 0, pitOccupation);
            Game.SetOccupation(node.State, node.State.turn, node.State.pit, 0);

            node.State.state = "reversePut";

            Game.PrevPit(node.State);

            break;
        }

        case "reversePut":
        {
            Game.IncOccupation(node.State, node.State.turn, node.State.pit);
            Game.DecOccupation(node.State, "hand", 0);

            if (Game.GetOccupation(node.State, "hand", 0) === 0)
            {
                node.State.state = "end";
            }
            else
            {
                Game.PrevPit(node.State);
            }

            break;
        }
    }
}

function DrawTree(node) // Recursive
{
    if (node == null) return;

    if (node.score > 0 && node.children.length === 0)
    {
        BackTrack(node);
        return;
    }

    for (let child of node.children)
    {
        DrawTree(child);
    }
}

function BackTrack(node)
{
    if (node == null) return;

    console.log("Depth: " + node.depth + ", pit: " + node.pit + ", score: " + node.score);

    BackTrack(node.parent);
}