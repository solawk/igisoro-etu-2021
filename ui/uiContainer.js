import
{
    CanvasSettings
} from "../rendering.js";

export function UI_Container(element, x, y, z)
{
    this.element = element;
    this.x = x;
    this.y = y;
    this.z = z;
}

UI_Container.prototype.Draw = function()
{
    this.element.Draw(this.x * CanvasSettings.canvasW, this.y * CanvasSettings.canvasW);
}

UI_Container.prototype.Click = function(x, y)
{
    this.element.Click((x / CanvasSettings.canvasW) - this.x, (y / CanvasSettings.canvasW) - this.y);
}