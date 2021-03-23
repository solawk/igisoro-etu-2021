import
{
    CanvasSettings
} from "../rendering.js";

export function UI_Container(element, x, y, absolute = false)
{
    this.element = element;
    this.x = x;
    this.y = y;
}

UI_Container.prototype.Draw = function()
{
    this.element.Draw(this.x * CanvasSettings.canvasW, this.y * CanvasSettings.canvasH);
}

UI_Container.prototype.Click = function(x, y)
{
    this.element.Click(x - this.x, y - this.y);
}