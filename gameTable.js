import
{
    Pit
} from './pit.js'

import
{
    Transfer
} from "./transfer.js";

import
{
    CanvasSettings,
    Images,
    Redraw
} from "./rendering.js";

import * as Bunches from "./bunches.js";

const ReverseStepMax = 20;
const ReverseStepTime = 16;

export function GameTable(connector, turn, field, stepTime, side)
{
    this.connector = connector;
    this.side = side;

    this.stepTime = stepTime;
    this.turn = turn;
    this.handPitIndexPosition = 0;
    this.handDrawOppositeSideFlag = false;

    this.ReverseSource = -1;
    this.ReverseStep = 0;

    this.winner = null;

    // Pits
    this.Pits = [];
    for (let i = 0; i < 16; i++)
    {
        this.Pits.push(new Pit(this, "top", i));
        this.Pits.push(new Pit(this, "bottom", i));
    }
    this.Hand = new Pit(this, "hand", 0);

    // Transfers
    this.Transfers = [];

    let me = this;
    setInterval(function()
    {
        me.MoveTransfers();
    }, 16);

    this.LoadPitOccupation(field);
}

GameTable.prototype.Draw = function(x, y)
{
    this.DrawBorderLines();

    this.DrawTurnIndicator();

    // Pits
    for (let i = 0; i < this.Pits.length; i++)
    {
        this.Pits[i].draw(this.DrawSeeds);
    }

    this.Hand.draw(this.DrawSeeds);

    // Transfers
    for (let i = 0; i < this.Transfers.length; i++)
    {
        this.Transfers[i].draw(this.DrawSeeds);
    }

    this.DrawReverseArrows();
}

GameTable.prototype.Click = function(x, y)
{
    for (let i = 0; i < this.Pits.length; i++)
    {
        if (this.Pits[i].isClicked(x, y))
        {
            this.connector.OutputCallbacks.StartMove.call(this.connector.Callers.Game, this.Pits[i].index, this.Pits[i].side);
            return true;
        }
    }

    return false;
}

GameTable.prototype.Destroy = function()
{
}

GameTable.prototype.DrawBorderLines = function()
{
    const buttonLocations =
        [
            0.35, 0.65,
        ];

    const BorderImage = Images.get("border").image;

    let leftEdgeX = 0;
    let rightEdgeX = 0;
    let nextEdgeIndex = 1;

    while (rightEdgeX !== 1)
    {
        if (buttonLocations.length < nextEdgeIndex)
        {
            rightEdgeX = 1;
        }
        else
        {
            rightEdgeX = buttonLocations[nextEdgeIndex - 1] + 0.003;
        }

        CanvasSettings.context.drawImage(BorderImage,
            leftEdgeX * CanvasSettings.canvasW, (CanvasSettings.canvasH / 2) - (CanvasSettings.pitSize / 8),
            (rightEdgeX - leftEdgeX) * CanvasSettings.canvasW, CanvasSettings.pitSize / 4);

        if (buttonLocations.length >= nextEdgeIndex)
        {
            leftEdgeX = buttonLocations[nextEdgeIndex] - 0.003;
        }

        nextEdgeIndex += 2;
    }
}

GameTable.prototype.DrawSeeds = function(count, x, y, sizeMultiplier = 1)
{
    if (count === 0) return;

    let positions = Bunches.positions(count);
    let seedSize = (CanvasSettings.pitSize / 6) * Bunches.seedSize(count) * sizeMultiplier;

    for (let i = 0; i < positions.length; i += 2)
    {
        let sx = positions[i] * seedSize;
        let sy = -positions[i + 1] * seedSize;

        CanvasSettings.context.drawImage(Images.get("seed").image, x + sx - (seedSize / 2), y + sy - (seedSize / 2), seedSize, seedSize);
    }
}

GameTable.prototype.DrawTurnIndicator = function()
{
    const turn = this.turn;

    if (turn === "bottom")
    {
        CanvasSettings.context.drawImage(Images.get("turn").image, 0, CanvasSettings.canvasH * (1 - 1 / 32),
            CanvasSettings.canvasW, CanvasSettings.canvasH * (1 / 32));
    }
    else
    {
        CanvasSettings.context.rotate(Math.PI);

        CanvasSettings.context.drawImage(Images.get("turn").image, -CanvasSettings.canvasW, -CanvasSettings.canvasH * (1 / 32),
            CanvasSettings.canvasW, CanvasSettings.canvasH * (1 / 32));

        CanvasSettings.context.setTransform(1, 0, 0, 1, 0, 0);
    }
}

GameTable.prototype.CreateTransfer = function(count, originSide, originIndex, destinationSide, destinationIndex)
{
    this.handDrawOppositeSideFlag = false;

    let handNewIndex = -1;

    if (originSide === this.turn) handNewIndex = originIndex;
    if (destinationSide === this.turn) handNewIndex = destinationIndex;
    if (handNewIndex !== -1)
    {
        if (handNewIndex > 7) handNewIndex = 15 - handNewIndex;
        if (handNewIndex === 0) handNewIndex++;
        this.handPitIndexPosition = handNewIndex;
    }
    else
    {
        this.handDrawOppositeSideFlag = true;
    }

    this.Transfers.push(new Transfer(this, count, originSide, originIndex, destinationSide, destinationIndex));
}

GameTable.prototype.MoveTransfers = function()
{
    let needRedraw = false;

    for (let i = 0; i < this.Transfers.length; i++)
    {
        if (this.Transfers[i] != null)
        {
            this.Transfers[i].step();
            needRedraw = true;
        }
    }

    if (needRedraw)
    {
        Redraw();
    }
}

GameTable.prototype.GetPit = function(side, index)
{
    if (side === "hand") return this.Hand;

    for (let i = 0; i < this.Pits.length; i++)
    {
        if (this.Pits[i].side === side && this.Pits[i].index === index)
        {
            return this.Pits[i];
        }
    }
}

GameTable.prototype.SetPitOccupation = function(side, index, occupation)
{
    let PitToModify;

    if (side === "hand") PitToModify = this.Hand;

    for (let i = 0; i < this.Pits.length; i++)
    {
        if (this.Pits[i].side === side && this.Pits[i].index === index)
        {
            PitToModify = this.Pits[i];
        }
    }

    PitToModify.setOccupation(occupation);

    //this.Draw();
}

GameTable.prototype.SetTurn = function(turn)
{
    this.turn = turn;
    Redraw();
}

GameTable.prototype.LoadPitOccupation = function(field)
{
    for (let i = 0; i < 16; i++)
    {
        this.SetPitOccupation("top", i, field.topOccupations[i]);
        this.SetPitOccupation("bottom", i, field.bottomOccupations[i]);
    }

    this.SetPitOccupation("hand", 0, 0);
}

GameTable.prototype.SetReverse = function(src)
{
    this.ReverseSource = src;

    if (this.ReverseSource === -1)
    {
        this.ReverseStep = 0;
    }
    else
    {
        const me = this;
        setTimeout(function()
        {
            me.IncreaseReverse(me);
        }, ReverseStepTime);
    }
}

GameTable.prototype.IncreaseReverse = function(me)
{
    me.ReverseStep++;
    if (me.ReverseStep < ReverseStepMax)
    {
        setTimeout(function()
        {
            me.IncreaseReverse(me);
        }, ReverseStepTime);
    }

    Redraw();
}

GameTable.prototype.DrawReverseArrows = function()
{
    if (this.ReverseSource === -1) return;

    CanvasSettings.context.globalAlpha = (this.ReverseStep / 20) * 0.65;
    let distanceFromSource = (CanvasSettings.pitSize + CanvasSettings.pitGap) * Math.pow(this.ReverseStep / 20, 1 / 4);

    let sourcePit = this.GetPit(this.turn, this.ReverseSource);

    switch (this.ReverseSource)
    {
        case 1:
        case 6:
        {
            this.DrawSingleReverseArrow(sourcePit, distanceFromSource, 180);
            this.DrawSingleReverseArrow(sourcePit, distanceFromSource, 0);

            break;
        }

        case 8:
        {
            this.DrawSingleReverseArrow(sourcePit, distanceFromSource, 270);
            this.DrawSingleReverseArrow(sourcePit, distanceFromSource, 0);

            break;
        }

        case 15:
        {
            this.DrawSingleReverseArrow(sourcePit, distanceFromSource, 270);
            this.DrawSingleReverseArrow(sourcePit, distanceFromSource, 180);

            break;
        }
    }

    CanvasSettings.context.globalAlpha = 1;
}

GameTable.prototype.DrawSingleReverseArrow = function(src, d, angle)
{
    CanvasSettings.context.translate(src.getCenterX(), src.getCenterY());

    let rotation = this.turn === "bottom" ? angle : angle + 180;
    CanvasSettings.context.rotate(rotation * Math.PI / 180);

    CanvasSettings.context.drawImage(Images.get("arrow").image, -(CanvasSettings.pitSize / 4) + d, -(CanvasSettings.pitSize / 4),
        CanvasSettings.pitSize / 2, CanvasSettings.pitSize / 2);

    CanvasSettings.context.setTransform(1, 0, 0, 1, 0, 0);
}

GameTable.prototype.HandX = function()
{
    let sideMultiplier = 1;
    if (this.side === "bottom") sideMultiplier *= -1;
    if (this.turn === "top") sideMultiplier *= -1;

    let xFromCenter = this.handPitIndexPosition - 4; // -4 -3 -2 -1 1 2 3 4

    let gapsTotalDistance = xFromCenter * CanvasSettings.pitGap;
    let pitsTotalDistance = xFromCenter * CanvasSettings.pitSize;

    return Math.floor(CanvasSettings.canvasW / 2 + (gapsTotalDistance + pitsTotalDistance) * sideMultiplier);
}

GameTable.prototype.HandY = function()
{
    let afterOffset = CanvasSettings.pitSize;

    let sideMultiplier = -1;
    if (this.side === "bottom") sideMultiplier *= -1;
    if (this.turn === "top") sideMultiplier *= -1;
    if (this.handDrawOppositeSideFlag === true) sideMultiplier *= -1;

    return Math.floor(CanvasSettings.canvasH / 2 + sideMultiplier * (CanvasSettings.pitBorderOffset + afterOffset));
}

GameTable.prototype.PitsFlushTexts = function()
{
    for (let i = 0; i < this.Pits.length; i++)
    {
        this.Pits[i].flushTextToVisualElements();
    }

    this.Hand.flushTextToVisualElements();
}