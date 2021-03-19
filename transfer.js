export function Transfer(parent, count, originSide, originIndex, destinationSide, destinationIndex)
{
    this.scene = parent;

    this.count = count;

    this.dPit = this.scene.GetPit(destinationSide, destinationIndex); // Destination pit
    this.dX = this.dPit.getCenterX();
    this.dY = this.dPit.getCenterY();
    this.dPit.delayedSeeds += this.count;

    this.intervalTime = 16; // TO DO
    this.steps = Math.floor(this.scene.stepTime * 100 * (1 / 2) / this.intervalTime);

    let originPit = this.scene.GetPit(originSide, originIndex);
    this.x = originPit.getCenterX();
    this.y = originPit.getCenterY();
    this.stepsMade = 0;
}

Transfer.prototype.step = function()
{
    this.stepsMade++;
    if (this.stepsMade === this.steps)
    {
        this.dPit.flushDelayedSeeds(this.count);
        this.scene.Draw();

        let thisIndex = this.scene.Transfers.indexOf(this);
        this.scene.Transfers.splice(thisIndex, 1);
    }

    this.x += (this.dX - this.x) / 6;
    this.y += (this.dY - this.y) / 6;
}

Transfer.prototype.draw = function(drawSeedsRoutine)
{
    drawSeedsRoutine(this.count, this.x, this.y);
}