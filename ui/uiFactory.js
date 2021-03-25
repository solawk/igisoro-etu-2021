import
{
    UI_Container
} from "./uiContainer.js";

import
{
    UI_Text
} from "./uiText.js";

import
{
    VisualElements,
    CanvasSettings
} from "../rendering.js";

//let TextSize = CanvasSettings.standardFontSize;
let TextColor = "rgba(255, 255, 255, 1)";
let TextShadow = true;

export function CreateContainer(element, x, y)
{
    return new UI_Container(element, x, y);
}

export function CreateText(x, y, text, absolute, name)
{
    let textContainer = CreateTemporaryText(x, y, text, absolute);
    VisualElements.set(name, textContainer);

    return textContainer;
}

export function CreateTemporaryText(x, y, text, absolute)
{
    let textElement = new UI_Text(text, CanvasSettings.standardFontSize, TextColor, TextShadow);
    if (absolute)
        return CreateContainer(textElement, x / CanvasSettings.canvasW, y / CanvasSettings.canvasH);
    else
        return CreateContainer(textElement, x, y);
}