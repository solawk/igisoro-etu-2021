import
{
    CanvasSettings,
    Images
} from "../rendering.js";

export function UI_Image(image, size, callback)
{
    this.imageName = image;
    this.sizeRatio = size;
    this.callback = callback;
}

UI_Image.prototype.Draw = function(x, y, rotation)
{
    if (this.imageName == null) return;

    const image = Images.get(this.imageName).image;

    const size = CanvasSettings.canvasW * this.sizeRatio * CanvasSettings.dpr;

    CanvasSettings.context.drawImage(image, x - size / 2, y - size / 2, size, size);
}

UI_Image.prototype.Click = function(x, y)
{
    if (this.callback)
    {
        if (x >= -this.sizeRatio / 2 && y * 9 / 16 >= -this.sizeRatio / 2 && x <= this.sizeRatio / 2 && y * 9 / 16 <= this.sizeRatio / 2)
        {
            this.callback();
            return true;
        }
    }

    return false;
}

UI_Image.prototype.Destroy = function()
{
}