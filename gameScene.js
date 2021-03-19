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

export function GameScene(turn, field, stepTime)
{
    this.stepTime = stepTime;
    this.turn = turn;

    this.handX = CanvasSettings.canvasW / 2;
    this.handY = CanvasSettings.canvasH / 2;

    this.ReverseSource = -1;
    this.ReverseStep = 0;

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

GameScene.prototype.Draw = function()
{
    CanvasSettings.context.drawImage(Images.get("border").image, 0, (CanvasSettings.canvasH / 2) - (CanvasSettings.pitSize / 8),
        CanvasSettings.canvasW, CanvasSettings.pitSize / 4);

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

GameScene.prototype.DrawSeeds = function(count, x, y)
{
    if (count === 0) return;

    let positions = Bunches.positions(count);
    let seedSize = (CanvasSettings.pitSize / 6) * Bunches.seedSize(count);

    for (let i = 0; i < positions.length; i += 2)
    {
        let sx = positions[i] * seedSize;
        let sy = -positions[i + 1] * seedSize;

        CanvasSettings.context.drawImage(Images.get("seed").image, x + sx - (seedSize / 2), y + sy - (seedSize / 2), seedSize, seedSize);
    }
}

GameScene.prototype.DrawTurnIndicator = function()
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

GameScene.prototype.CreateTransfer = function(count, originSide, originIndex, destinationSide, destinationIndex)
{
    this.Transfers.push(new Transfer(this, count, originSide, originIndex, destinationSide, destinationIndex));
}

GameScene.prototype.MoveTransfers = function()
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

GameScene.prototype.GetPit = function(side, index)
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

GameScene.prototype.SetPitOccupation = function(side, index, occupation)
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

GameScene.prototype.SetTurn = function(turn)
{
    this.turn = turn;
    Redraw();
}

GameScene.prototype.LoadPitOccupation = function(field)
{
    for (let i = 0; i < 16; i++)
    {
        this.SetPitOccupation("top", i, field.topOccupations[i]);
        this.SetPitOccupation("bottom", i, field.bottomOccupations[i]);
    }

    this.SetPitOccupation("hand", 0, 0);
}

GameScene.prototype.SetReverse = function(src)
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

GameScene.prototype.IncreaseReverse = function(me)
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

GameScene.prototype.DrawReverseArrows = function()
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

GameScene.prototype.DrawSingleReverseArrow = function(src, d, angle)
{
    CanvasSettings.context.translate(src.getCenterX(), src.getCenterY());

    let rotation = this.turn === "bottom" ? angle : angle + 180;
    CanvasSettings.context.rotate(rotation * Math.PI / 180);

    CanvasSettings.context.drawImage(Images.get("arrow").image, -(CanvasSettings.pitSize / 4) + d, -(CanvasSettings.pitSize / 4),
        CanvasSettings.pitSize / 2, CanvasSettings.pitSize / 2);

    CanvasSettings.context.setTransform(1, 0, 0, 1, 0, 0);
}