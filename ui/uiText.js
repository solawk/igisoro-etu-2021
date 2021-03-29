import
{
    CanvasSettings
} from "../rendering.js";

export function UI_Text(text, size, color, shadow)
{
    this.text = text;
    this.sizeRatio = size;
    this.color = color;
    this.shadow = shadow;
}

UI_Text.prototype.CalcSize = function()
{
    return this.sizeRatio * CanvasSettings.standardFontSize;
}

UI_Text.prototype.Draw = function(x, y)
{
    CanvasSettings.context.fillStyle = this.color;

    const size = this.CalcSize();
    CanvasSettings.context.font = "bold " + size + "px math";
    CanvasSettings.context.textAlign = "center";

    if (this.shadow)
    {
        CanvasSettings.context.fillStyle = "rgba(0, 0, 0, 1)";
        CanvasSettings.context.fillText(this.text, x - (size / 10), y + size / 4);
    }

    CanvasSettings.context.fillStyle = "rgba(255, 255, 255, 1)";
    CanvasSettings.context.fillText(this.text, x, y + size / 4);
}

UI_Text.prototype.Click = function(x, y)
{
    return false;
}