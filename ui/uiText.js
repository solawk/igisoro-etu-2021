import
{
    CanvasSettings
} from "../rendering.js";

export function UI_Text(text, x, y, size, color = "rgba(255, 255, 255, 1)", shadow = true)
{
    this.text = text;
    this.x = x;
    this.y = y;
    this.size = size;
    this.shadow = shadow
}

UI_Text.prototype.Draw = function()
{
    CanvasSettings.context.fillStyle = "rgba(255, 255, 255, 1)";

    CanvasSettings.context.font = "bold " + this.size + "px math";

    if (this.shadow)
    {
        CanvasSettings.context.fillStyle = "rgba(0, 0, 0, 1)";
        CanvasSettings.context.fillText(this.text, this.x - (this.size / 10), this.y);
    }

    CanvasSettings.context.fillStyle = "rgba(255, 255, 255, 1)";
    CanvasSettings.context.fillText(this.text, this.x, this.y);
}