import
{
    CanvasSettings
} from "../rendering.js";

import
{
    DrawFrame
} from "./uiFrame.js";

export function UI_Button(length, height, callback)
{
    this.lengthRatio = length;
    this.heightRatio = height;

    this.callback = callback;
}

UI_Button.prototype.Draw = function(x, y)
{
    // Background drawing
    DrawFrame(x, y, CanvasSettings.deratio(this.lengthRatio), CanvasSettings.deratio(this.heightRatio));
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

UI_Button.prototype.Destroy = function()
{
}