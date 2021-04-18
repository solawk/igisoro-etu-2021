import {
    CanvasSettings, Images
} from "../rendering.js";

export function DrawFrame(x, y, length, height)
{
    const pitHalfImage = Images.get("pitHalf").image;
    const pitGradientImage = Images.get("pitGradient").image;

    CanvasSettings.context.drawImage(pitHalfImage, x - length / 2, y - height / 2, height / 2, height);
    CanvasSettings.context.drawImage(pitGradientImage, x - length / 2 + height / 2, y - height / 2, length - height, height);

    CanvasSettings.context.translate(x + length / 2 - height / 2, y);
    CanvasSettings.context.rotate(Math.PI);
    CanvasSettings.context.drawImage(pitHalfImage, 0, -height / 2, -height / 2, height);
    CanvasSettings.context.setTransform(1, 0, 0, 1, 0, 0);
}