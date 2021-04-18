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
    this.visible = true;
}

UI_Container.prototype.SwitchVisibility = function(visible)
{
    this.visible = visible;
}

UI_Container.prototype.Draw = function()
{
    if (!this.visible) return;

    this.element.Draw(this.x * CanvasSettings.canvasW, this.y * CanvasSettings.canvasW);
}

UI_Container.prototype.Click = function(x, y)
{
    if (!this.visible) return false;

    return this.element.Click((x / CanvasSettings.canvasW) - this.x, (y / CanvasSettings.canvasW) - this.y);
}

UI_Container.prototype.Destroy = function()
{
    this.element.Destroy();
}