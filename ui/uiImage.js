import
{
    CanvasSettings,
    Images
} from "../rendering.js";

export function UI_Image(image, size)
{
    this.imageName = image;
    this.sizeRatio = size;
}

UI_Image.prototype.Draw = function(x, y, rotation)
{
    if (this.imageName == null) return;

    const image = Images.get(this.imageName).image;

    const size = CanvasSettings.canvasW * this.sizeRatio;

    CanvasSettings.context.drawImage(image, x - size / 2, y - size / 2, size, size);
}

UI_Image.prototype.Click = function(x, y)
{
    return false;
}

UI_Image.prototype.Destroy = function()
{
}