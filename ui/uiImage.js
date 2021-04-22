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

UI_Image.prototype.Draw = function(x, y)
{
    if (this.imageName == null) return;

    const image = Images.get(this.imageName).image;

    const w = CanvasSettings.canvasW * this.sizeRatio;
    const h = CanvasSettings.canvasW * this.sizeRatio;

    CanvasSettings.context.drawImage(image, x - w / 2, y - h / 2, w, h);
}

UI_Image.prototype.Click = function(x, y)
{
    return false;
}

UI_Image.prototype.Destroy = function()
{
}