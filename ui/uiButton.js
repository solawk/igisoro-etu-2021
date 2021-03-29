import
{
    CanvasSettings,
    Images
} from "../rendering.js";

import * as UI_Factory from "./uiFactory.js";

export function UI_Button(length, height, callback)
{
    this.lengthRatio = length;
    this.heightRatio = height;

    this.callback = callback;
}

UI_Button.prototype.CalcLength = function()
{
    return this.lengthRatio * CanvasSettings.canvasW;
}

UI_Button.prototype.CalcHeight = function()
{
    return this.heightRatio * CanvasSettings.canvasW;
}

UI_Button.prototype.Draw = function(x, y)
{
    // Background drawing
    this.DrawButton(x, y);
}

UI_Button.prototype.DrawButton = function(x, y)
{
    const length = this.CalcLength();
    const height = this.CalcHeight();

    const pitHalfImage = Images.get("pitHalf").image;
    const pitGradientImage = Images.get("pitGradient").image;

    CanvasSettings.context.drawImage(pitHalfImage, x - length / 2, y - height / 2, height / 2, height);
    CanvasSettings.context.drawImage(pitGradientImage, x - length / 2 + height / 2, y - height / 2, length - height, height);

    CanvasSettings.context.translate(x + length / 2 - height / 2, y);
    CanvasSettings.context.rotate(Math.PI);
    CanvasSettings.context.drawImage(pitHalfImage, 0, -height / 2, -height / 2, height);
    CanvasSettings.context.setTransform(1, 0, 0, 1, 0, 0);
}

UI_Button.prototype.Click = function(x, y)
{
    let amIHit = false;

    // Gradient hit region
    //            Left border                       Right border
    if (x >= (-this.lengthRatio / 2 + this.heightRatio / 2) && x <= (this.lengthRatio / 2 - this.heightRatio / 2) &&
    //      Top border           BottomBorder
        y >= (-this.heightRatio / 2) && y <= (this.heightRatio / 2)) amIHit = true;

    // Left edge hit region
    const distanceToLeftPitHalf = Math.sqrt(Math.pow(x - ((-this.lengthRatio + this.heightRatio) / 2), 2) + Math.pow(y, 2));
    if (distanceToLeftPitHalf < (this.heightRatio / 2)) amIHit = true;

    // Right edge hit region
    const distanceToRightPitHalf = Math.sqrt(Math.pow(x - ((this.lengthRatio - this.heightRatio) / 2), 2) + Math.pow(y, 2));
    if (distanceToRightPitHalf < (this.heightRatio / 2)) amIHit = true;

    if (amIHit)
    {
        this.callback();
        return true;
    }
    else
    {
        return false;
    }
}