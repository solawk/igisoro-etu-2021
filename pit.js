import
{
    CanvasSettings,
    Images
} from "./rendering.js";

import * as UI_Factory from "./ui/uiFactory.js";

export function Pit(parent, side, index)
{
    this.table = parent;

    this.side = side;
    this.index = index;

    this.occupation = 0;
    this.delayedSeeds = 0; // Seeds that are currently being transferred into the pit

    const occupationTextX = (this.getCenterX() + (CanvasSettings.pitSize * (1 / 3))) / CanvasSettings.canvasW;
    const occupationTextY = (this.getCenterY() - (CanvasSettings.pitSize * (1 / 3))) / CanvasSettings.canvasW;
    this.occupationTextContainer = UI_Factory.CreateTemporaryText(occupationTextX, occupationTextY, -1, 0, 1);
}

Pit.prototype.flushTextToVisualElements = function()
{
    UI_Factory.MapElement(this.side + "Pit" + this.index + "Occupation", this.occupationTextContainer);
}

Pit.prototype.getCenterX = function()
{
    if (this.side === "hand") return this.table.HandX();

    let indexX = this.index < 8 ? this.index : 15 - this.index; // 0-7 from left to right

    let sideMultiplier = 1;
    if (this.side === "bottom") sideMultiplier *= -1;
    if (this.table.side === "top") sideMultiplier *= -1;

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
    if (this.side === "hand") return this.table.HandY();

    let row = this.index < 8 ? 0 : 1;

    let afterOffset = CanvasSettings.pitSize * (0.5 + row) + CanvasSettings.pitGap * row;

    let sideMultiplier = -1;
    if (this.side === "bottom") sideMultiplier *= -1;
    if (this.table.side === "top") sideMultiplier *= -1;

    return Math.floor(CanvasSettings.canvasH / 2 + sideMultiplier * (CanvasSettings.pitBorderOffset + afterOffset));
}

Pit.prototype.isClicked = function(x, y)
{
    x *= CanvasSettings.canvasW;
    y *= CanvasSettings.canvasW;
    return Math.sqrt(Math.pow(x - this.getCenterX(), 2) + Math.pow(y - this.getCenterY(), 2)) < (CanvasSettings.pitSize / 2);
}

Pit.prototype.setOccupation = function(occupation)
{
    this.occupation = occupation;
    this.updateOccupationText();
}

Pit.prototype.addDelayedSeeds = function(dSeedsAmount)
{
    this.delayedSeeds += dSeedsAmount;
    this.updateOccupationText();
}

Pit.prototype.updateOccupationText = function()
{
    const visualOccupation = this.occupation - this.delayedSeeds;
    this.occupationTextContainer.element.text = visualOccupation > 0 ? visualOccupation : "";
}

Pit.prototype.getOccupation = function()
{
    return this.occupation;
}

Pit.prototype.draw = function(drawSeedsRoutine)
{
    this.occupationTextContainer.x = (this.getCenterX() + (CanvasSettings.pitSize * (1 / 3))) / CanvasSettings.canvasW;
    this.occupationTextContainer.y = (this.getCenterY() - (CanvasSettings.pitSize * (1 / 3))) / CanvasSettings.canvasW;

    this.drawPit();

    let occupation = this.getOccupation() - this.delayedSeeds;
    drawSeedsRoutine(occupation, this.getCenterX(), this.getCenterY(), this.side !== "hand" ? 1 : 0.6);
}

Pit.prototype.drawPit = function()
{
    if (this.side !== "hand")
    {
        CanvasSettings.context.drawImage(Images.get("pit").image,
            this.getCenterX() - CanvasSettings.pitSize / 2, this.getCenterY() - CanvasSettings.pitSize / 2,
            CanvasSettings.pitSize, CanvasSettings.pitSize);
    }
    else if (this.occupation + this.delayedSeeds > 0)
    {
        CanvasSettings.context.drawImage(Images.get("handShadow").image,
            this.getCenterX() - CanvasSettings.pitSize / 4, this.getCenterY() - CanvasSettings.pitSize / 4 - 4,
            CanvasSettings.pitSize / 2, CanvasSettings.pitSize / 2);

        CanvasSettings.context.drawImage(Images.get("hand").image,
            this.getCenterX() - CanvasSettings.pitSize / 4 + 4, this.getCenterY() - CanvasSettings.pitSize / 4 - 4,
            CanvasSettings.pitSize / 2, CanvasSettings.pitSize / 2);
    }
}

Pit.prototype.flushDelayedSeeds = function(count)
{
    this.delayedSeeds -= count;
    this.updateOccupationText();
}