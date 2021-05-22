export function AI(connector, side, settings)
{
    this.connector = connector;
    this.game = this.connector.Callers.Server;

    this.side = side;
    this.connector.Callers.Client.aiSide = this.side;

    this.settings = settings;
    // settings:
    // randomness (0-100%)
    // depth (1+)

    this.React();
}

AI.prototype.React = function()
{
    if (this.connector.Callers.Server.turn === this.side)
    {
        //console.log("MAKING A MOVE: " + Date.now() % 1000000);
        this.MakeMove();
    }
}

AI.prototype.MakeMove = function()
{
    //const CalcStart = Date.now();
    const RootNode = NodeFromGame(this.game);
    const AIMaximizing = RootNode.turn === "bottom";
    ExpandTree(RootNode, this.settings.depth);

    const moveChances = [];
    const moveValidity = []; // 0 - doesn't exist, 1 - bad, 2 - good

    let maxRating = negInfinity;
    let minRating = posInfinity;

    for (let i = 0; i < 16; i++)
    {
        let thisMoveExists = false;
        let moveRating = 0;

        for (const nextMove of RootNode.children)
        {
            if (nextMove.moveThatLedToMe === i)
            {
                thisMoveExists = true;

                moveRating = AIMaximizing ? nextMove.score : -nextMove.score;
                if (moveRating > maxRating) maxRating = moveRating;
                if (moveRating < minRating) minRating = moveRating;

                break;
            }
        }

        moveValidity.push(thisMoveExists ? 2 : 0);

        moveChances.push(thisMoveExists ? moveRating : 0);
    }

    let goodMoves = 0;

    for (let i = 0; i < 16; i++)
    {
        if (!moveValidity[i]) continue;

        if (moveChances[i] < maxRating)
        {
            moveValidity[i] = 1;
            moveChances[i] = 0;
        }
        else
        {
            goodMoves++;
            moveChances[i] = 1;
        }
    }

    let pitToChoose = -1;

    let chanceSum = 0;
    for (let i = 0; i < 16; i++)
    {
        chanceSum += moveChances[i];
    }
    let roll = Math.random() * chanceSum;
    for (let i = 0; i < 16; i++)
    {
        roll -= moveChances[i];
        if (roll <= 0)
        {
            pitToChoose = i;
            break;
        }
    }

    //console.log("Validities: " + moveValidity);

    // Adding randomness
    const avgChance = goodMoves / RootNode.children.length;
    const AIt = this.settings.randomness / 100;

    const Lerp = function(from, to, t)
    {
        return from * (1 - t) + to * t;
    }

    for (let i = 0; i < 16; i++)
    {
        if (moveValidity[i] === 1)
        {
            moveChances[i] = Lerp(0, avgChance, AIt);
            continue;
        }

        if (moveValidity[i] === 2)
        {
            moveChances[i] = Lerp(1, avgChance, AIt);
        }
    }

    //console.log("Move chances:", moveChances);
    console.log("AI: I choose " + pitToChoose + " with a " + ((moveChances[pitToChoose] / chanceSum) * 100) + "% chance");
    //const CalcDuration = Date.now() - CalcStart;
    //console.log("Calculation time: " + CalcDuration + " ms");

    // Outputting the move
    const me = this;

    const sleepInterval = setInterval(function()
    {
        if (me.connector.Callers.Server.state === "Idle")
        {
            me.connector.ClientToServerCallbacks.StartMove.call(me.connector.Callers.Server, pitToChoose, me.side);

            clearInterval(sleepInterval);
        }

        if (me.connector.Callers.Server.state === "ReverseIdle")
        {
            setTimeout(function()
            {
                me.connector.ClientToServerCallbacks.StartMove.call(me.connector.Callers.Server, pitToChoose, me.side);
            }, 1000);

            clearInterval(sleepInterval);
        }
    }, 50);
}

function NodeFromGame(game)
{
    return new Node
    (
        null,
        game.state,
        [...game.bottomOccupations],
        [...game.topOccupations],
        game.turn,
        game.pit,
        game.sowPit,
        game.normalCaptureMade,
        game.turnsMade,
        game.reverseLevel
    );
}

function ExpandTree(root, depth)
{
    expansionsCount = 0;
    totalChildren = 0;
    root.expand(depth, negInfinity, posInfinity, root.turn === "bottom");
    //root.print(0);
}

function Node(moveThatLedToMe, state, bottomOcc, topOcc, turn, pit, sowPit, normalCapMade, turnsMade, revLvl)
{
    this.moveThatLedToMe = moveThatLedToMe;

    this.state = state;
    this.bottomOccupations = bottomOcc;
    this.topOccupations = topOcc;
    this.turn = turn;
    this.pit = pit;
    this.sowPit = sowPit;
    this.normalCaptureMade = normalCapMade;
    this.turnsMade = turnsMade;
    this.reverseLevel = revLvl;

    this.parent = null;
    this.children = [];
}

Node.prototype.moves = function()
{
    const occupations = this.turn === "top" ? this.topOccupations : this.bottomOccupations;
    const allowedMoves = [];

    if (this.state !== "ReverseIdle")
    {
        // Normal turn start

        for (let i = 0; i < 16; i++)
        {
            if (occupations[i] > 1)
            {
                allowedMoves.push(i);
            }
        }
    }
    else
    {
        // Reversing decision

        const reverseIndexes = game.GetReverseIndexes(this.pit);
        allowedMoves.push(reverseIndexes[0]);
        allowedMoves.push(reverseIndexes[1]);
    }

    return allowedMoves;
}

const negInfinity = -100;
const posInfinity = 100;
let expansionsCount = 0;
let totalChildren = 0;

function incExpansions()
{
    expansionsCount++;
    if (expansionsCount % 10000 === 0)
    {
        console.log("Expansions: " + expansionsCount);
        console.log("Branching: " + totalChildren / expansionsCount);
    }
}

function incChildren()
{
    totalChildren++;
}

Node.prototype.expand = function(depth, alpha, beta, isMaximizing)
{
    //console.log(depth);

    if (depth === 0)
    {
        // Reached maximum search depth, make a static evaluation
        this.score = this.evaluate();
        //console.log(this.score);

        return this.score;
    }
    //incExpansions();
    const allowedMoves = this.moves();

    this.score = isMaximizing ? negInfinity : posInfinity;

    // Creating children
    for (let moveIndex of allowedMoves)
    {
        //console.log("Calculating move " + moveIndex);
        //incChildren();
        const moveConnector = new gameConnector.GameConnector();
        moveConnector.Dummy();

        const moveGame = game.StartGame(this.turn, -1,
            {topOccupations: this.topOccupations, bottomOccupations: this.bottomOccupations},
            this.reverseLevel, moveConnector);

        moveGame.state = this.state;
        moveGame.pit = this.pit;
        moveGame.sowPit = this.sowPit;
        moveGame.normalCaptureMade = this.normalCaptureMade;
        moveGame.turnsMade = this.turnsMade;
        moveGame.reverseLevel = this.reverseLevel;

        moveConnector.Callers.Server = moveGame;
        moveConnector.ClientToServerCallbacks.StartMove = moveGame.StartMove;

        moveConnector.ClientToServerCallbacks.StartMove.call(moveConnector.Callers.Server, moveIndex, this.turn);

        // Processing the result

        const moveNode = NodeFromGame(moveGame);
        //console.log(moveNode.evaluate());
        moveNode.moveThatLedToMe = moveIndex;
        moveNode.parent = this;
        this.children.push(moveNode);

        const movedIntoReverse = moveNode.state === "ReverseIdle";
        const movedIntoGameOver = moveNode.state === "Over";
        const timedout = moveNode.state === "Timeout";

        if (!timedout)
        {
            if (!movedIntoGameOver)
            {
                if (isMaximizing)
                {
                    this.score = Math.max(this.score, moveNode.expand(!movedIntoReverse ? depth - 1 : depth, alpha, beta, movedIntoReverse));
                    alpha = Math.max(alpha, this.score);
                    if (alpha > beta)
                    {
                        //console.log("beta cutoff");
                        break;
                    }
                }
                else
                {
                    this.score = Math.min(this.score, moveNode.expand(!movedIntoReverse ? depth - 1 : depth, alpha, beta, !movedIntoReverse));
                    beta = Math.min(beta, this.score);
                    if (beta < alpha)
                    {
                        //console.log("alpha cutoff");
                        break;
                    }
                }
            }
            else
            {
                moveNode.score = isMaximizing ? negInfinity : posInfinity;
                //console.log("game over for this node: " + moveNode.score);
            }
        }
        else
        {
            moveNode.score = this.evaluate();
        }
    }

    return this.score;
}

Node.prototype.evaluate = function()
{
    let bottomOccupationsSum = 0;

    for (const occ of this.bottomOccupations)
    {
        bottomOccupationsSum += occ;
    }

    return bottomOccupationsSum;
}

Node.prototype.print = function(depth)
{
    let tab = "--".repeat(depth);

    const isReverse = this.state === "ReverseIdle";
    const turn = (!isReverse ? (this.turn === "top" ? "bottom (min next)" : "top (max next)") : (this.turn));
    console.log(tab + " Node of " + turn + "'s" + (isReverse ? " reversing" : "") + " turn:");
    console.log(tab + " Pressed " + this.moveThatLedToMe);
    let childrenScores = "[";
    for (const child of this.children)
    {
        childrenScores += child.score + ",";
    }
    childrenScores += "]";
    console.log(tab + " Score: " + this.score + childrenScores);

    console.log(this.topOccupations.slice(8, 16).reverse());
    console.log(this.topOccupations.slice(0, 8));
    console.log(this.bottomOccupations.slice(0, 8).reverse());
    console.log(this.bottomOccupations.slice(8, 16));
    console.log("Children:");
    console.log("{");
    for (const child of this.children) child.print(depth + 1);
    console.log("}");
}