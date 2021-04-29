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

UI_Text.prototype.Draw = function(x, y, rotation)
{
    this.text = this.text.toString();

    const size = this.CalcSize();
    CanvasSettings.context.font = "bold " + size + "px Georgia, serif";
    CanvasSettings.context.textAlign = "center";

    CanvasSettings.context.translate(x, y);
    CanvasSettings.context.rotate(rotation);

    const splitText = this.text.split("\n");
    let line = 0;
    for (let subtext of splitText)
    {
        if (this.shadow)
        {
            CanvasSettings.context.fillStyle = "rgba(0, 0, 0, 1)";
            CanvasSettings.context.fillText(subtext, - (size / 10), size / 3 + (size * 1.2 * (line - Math.floor(splitText.length / 2))));
        }

        CanvasSettings.context.fillStyle = this.color;
        CanvasSettings.context.fillText(subtext, 0, size / 3 + (size * 1.2 * (line - Math.floor(splitText.length / 2))));

        line++;
    }

    CanvasSettings.context.setTransform(1, 0, 0, 1, 0, 0);
}

UI_Text.prototype.Click = function(x, y)
{
    return false;
}

UI_Text.prototype.Destroy = function()
{
}