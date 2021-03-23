import
{
    CanvasSettings
} from "../rendering.js";

export function UI_Text(text, size, color = "rgba(255, 255, 255, 1)", shadow = true)
{
    this.text = text;
    this.sizeRatio = size / CanvasSettings.standardFontSize;
    this.color = color;
    this.shadow = shadow;
}

UI_Text.prototype.Draw = function(x, y)
{
    CanvasSettings.context.fillStyle = this.color;

    const size = Math.floor(this.sizeRatio * CanvasSettings.standardFontSize);
    CanvasSettings.context.font = "bold " + size + "px math";

    if (this.shadow)
    {
        CanvasSettings.context.fillStyle = "rgba(0, 0, 0, 1)";
        CanvasSettings.context.fillText(this.text, x - (size / 10), y);
    }

    CanvasSettings.context.fillStyle = "rgba(255, 255, 255, 1)";
    CanvasSettings.context.fillText(this.text, x, y);
}

UI_Text.prototype.Click = function(x, y)
{

}