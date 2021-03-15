export function Pit(parentGame, side, index)
{
    this.game = parentGame;

    this.side = side;
    this.index = index;

    this.delayedSeeds = 0; // Seeds that are currently being transferred into the pit

    this.drawSettings = null;
}

Pit.prototype.setDrawSettings = function(CanvasSettings)
{
    this.drawSettings = CanvasSettings;
}

Pit.prototype.getCenterX = function()
{
    if (this.side === "hand") return this.game.handX;

    let indexX = this.index < 8 ? this.index : 15 - this.index; // 0-7 from left to right

    let sideMultiplier = this.side === "bottom" ? -1 : 1;

    let xFromCenter = indexX - 4; // -4 -3 -2 -1 1 2 3 4
    if (xFromCenter >= 0) xFromCenter++;

    let gapsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let gapsTotalDistance = gapsCount * this.drawSettings.pitGap;

    let pitsCount = xFromCenter - 0.5 * Math.sign(xFromCenter);
    let pitsTotalDistance = pitsCount * this.drawSettings.pitSize;

    return Math.floor(this.drawSettings.canvasW / 2 + (gapsTotalDistance + pitsTotalDistance) * sideMultiplier);
}

Pit.prototype.getCenterY = function()
{
    if (this.side === "hand") return this.game.handY;

    let row = this.index < 8 ? 0 : 1;

    let afterOffset = this.drawSettings.pitSize * (0.5 + row) + this.drawSettings.pitGap * row;

    let sideMultiplier = this.side === "bottom" ? 1 : -1;

    return Math.floor(this.drawSettings.canvasH / 2 + sideMultiplier * (this.drawSettings.pitBorderOffset + afterOffset));
}

Pit.prototype.isClicked = function(x, y)
{
    return Math.sqrt(Math.pow(x - this.getCenterX(), 2) + Math.pow(y - this.getCenterY(), 2)) < (this.drawSettings.pitSize / 2);
}

Pit.prototype.getOccupation = function()
{
    if (this.side === "bottom")
    {
        return this.game.bottomOccupations[this.index];
    }
    else if (this.side === "top")
    {
        return this.game.topOccupations[this.index];
    }
    else
    {
        return this.game.handOccupation;
    }
}

Pit.prototype.draw = function(drawSeedsRoutine, pitImage)
{
    if (this.side !== "hand") this.drawPit(pitImage);

    let occupation = this.getOccupation() - this.delayedSeeds;
    this.drawOccupation(occupation);
    drawSeedsRoutine(occupation, this.getCenterX(), this.getCenterY());
}

Pit.prototype.drawPit = function(pitImage)
{
    this.drawSettings.context.drawImage(pitImage.image,
        this.getCenterX() - this.drawSettings.pitSize / 2, this.getCenterY() - this.drawSettings.pitSize / 2,
        this.drawSettings.pitSize, this.drawSettings.pitSize);
}

Pit.prototype.drawOccupation = function(occupation)
{
    this.drawSettings.context.fillStyle = "rgba(255, 255, 255, 1)";

    if (occupation < 20)
    {
        this.drawSettings.context.font = "bold " + this.drawSettings.occupationFontSize + "px math";
        this.drawSettings.context.fillText(occupation,
            this.getCenterX() + (this.drawSettings.pitSize * (1 / 4)),
            this.getCenterY() - (this.drawSettings.pitSize * (1 / 4)));
    }
    else
    {
        this.drawSettings.context.font = "bold " + (this.drawSettings.occupationFontSize * 2) + "px math";
        this.drawSettings.context.fillText(occupation,
            this.getCenterX() - this.drawSettings.occupationFontSize,
            this.getCenterY() + (this.drawSettings.occupationFontSize / 1.5));
    }
}

Pit.prototype.flushDelayedSeeds = function(count)
{
    this.delayedSeeds -= count;
}