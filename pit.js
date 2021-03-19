import
{
    CanvasSettings,
    Images
} from "./rendering.js";

import
{
    UI_Text
} from "./ui/uiText.js";

export function Pit(parent, side, index)
{
    this.scene = parent;

    this.side = side;
    this.index = index;

    this.occupation = 0;
    this.delayedSeeds = 0; // Seeds that are currently being transferred into the pit
}

Pit.prototype.getCenterX = function()
{
    if (this.side === "hand") return this.scene.handX;

    let indexX = this.index < 8 ? this.index : 15 - this.index; // 0-7 from left to right

    let sideMultiplier = this.side === "bottom" ? -1 : 1;

    let xFromCenter = indexX - 4; // -4 -3 -2 -1 1 2 3 4
    if (xFromCenter >= 0) xFromCenter++;

    let gapsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let gapsTotalDistance = gapsCount * CanvasSettings.pitGap;

    let pitsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let pitsTotalDistance = pitsCount * CanvasSettings.pitSize;

    return Math.floor(CanvasSettings.canvasW / 2 + (gapsTotalDistance + pitsTotalDistance) * sideMultiplier);
}

Pit.prototype.getCenterY = function()
{
    if (this.side === "hand") return this.scene.handY;

    let row = this.index < 8 ? 0 : 1;

    let afterOffset = CanvasSettings.pitSize * (0.5 + row) + CanvasSettings.pitGap * row;

    let sideMultiplier = this.side === "bottom" ? 1 : -1;

    return Math.floor(CanvasSettings.canvasH / 2 + sideMultiplier * (CanvasSettings.pitBorderOffset + afterOffset));
}

Pit.prototype.isClicked = function(x, y)
{
    return Math.sqrt(Math.pow(x - this.getCenterX(), 2) + Math.pow(y - this.getCenterY(), 2)) < (CanvasSettings.pitSize / 2);
}

Pit.prototype.setOccupation = function(occupation)
{
    this.occupation = occupation;
}

Pit.prototype.getOccupation = function()
{
    return this.occupation;
}

Pit.prototype.draw = function(drawSeedsRoutine)
{
    if (this.side !== "hand") this.drawPit();

    let occupation = this.getOccupation() - this.delayedSeeds;
    this.drawOccupation(occupation);
    drawSeedsRoutine(occupation, this.getCenterX(), this.getCenterY());
}

Pit.prototype.drawPit = function()
{
    CanvasSettings.context.drawImage(Images.get("pit").image,
        this.getCenterX() - CanvasSettings.pitSize / 2, this.getCenterY() - CanvasSettings.pitSize / 2,
        CanvasSettings.pitSize, CanvasSettings.pitSize);
}

Pit.prototype.drawOccupation = function(occupation)
{
    const OccupationText = new UI_Text(occupation,
        this.getCenterX() + (CanvasSettings.pitSize * (1 / 4)),
        this.getCenterY() - (CanvasSettings.pitSize * (1 / 4)),
        CanvasSettings.occupationFontSize);

    OccupationText.Draw();
}

Pit.prototype.flushDelayedSeeds = function(count)
{
    this.delayedSeeds -= count;
}