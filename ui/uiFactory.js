import
{
    VisualElements
} from "../rendering.js";

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
    UI_Button
} from "./uiButton.js";

let TextColor = "rgba(255, 255, 255, 1)";
let TextShadow = true;

// x = 0, y = 0 is top-left
// higher z = further

export function CreateContainer(element, x, y, z)
{
    return new UI_Container(element, x, y, z);
}

export function MapElement(name, element)
{
    VisualElements.set(name, element);
}

export function CreateText(x, y, z, text, name)
{
    let textContainer = CreateTemporaryText(x, y, z, text);
    MapElement(name, textContainer);

    return textContainer;
}

export function CreateTemporaryText(x, y, z, text)
{
    let textElement = new UI_Text(text, 1, TextColor, TextShadow);
    return CreateContainer(textElement, x, y, z);
}

export function CreateButton(x, y, z, length, height, callback, text, name)
{
    let buttonElement = new UI_Button(length, height, callback);
    let buttonContainer = CreateContainer(buttonElement, x, y, z);
    MapElement(name, buttonContainer);

    CreateText(x, y, z, text, name + "Text");

    return buttonContainer;
}