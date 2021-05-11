import
{
    Redraw,
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

import
{
    UI_Input
} from "./uiInput.js";

import
{
    UI_Image
} from "./uiImage.js";

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

export function GetElement(name)
{
    if (VisualElements.get(name) == null) return null;

    return VisualElements.get(name).element;
}

export function RemoveElement(name)
{
    VisualElements.delete(name);
    Redraw();
}

export function ChangeElementText(name, text)
{
    const element = GetElement(name);
    element.text = text;
    Redraw();
}

export function ChangeElementImage(name, image)
{
    const element = GetElement(name);
    element.imageName = image;
    Redraw();
}

export function ChangeElementColor(name, color)
{
    const element = GetElement(name);
    element.color = color;
    Redraw();
}

export function SwitchElementVisibility(name, visibility)
{
    const element = VisualElements.get(name);

    if (visibility == null)
    {
        const currentVisibility = element.visibility;
        element.SwitchVisibility(!currentVisibility);
    }
    else
    {
        element.SwitchVisibility(visibility);
    }

    Redraw();
}

export function CreateText(x, y, z, text, name, size)
{
    let textContainer = CreateTemporaryText(x, y, z, text, size);
    MapElement(name, textContainer);

    Redraw();

    return textContainer;
}

export function CreateTemporaryText(x, y, z, text, size)
{
    let textElement = new UI_Text(text, size, TextColor, TextShadow);

    return CreateContainer(textElement, x, y, z);
}

export function CreateButton(x, y, z, length, height, callback, text, name, textSizeRatio, missCallback)
{
    let buttonElement = new UI_Button(length, height, callback, missCallback);

    let buttonContainer = CreateContainer(buttonElement, x, y, z);
    MapElement(name, buttonContainer);

    CreateText(x, y, z, text, name + "Text", textSizeRatio);

    Redraw();

    return buttonContainer;
}

export function CreateInput(x, y, z, length, height, field, type, maxLength, name)
{
    let inputElement = new UI_Input(length, height, field, type, maxLength);

    let inputContainer = CreateContainer(inputElement, x, y, z);
    inputElement.DeployInput(x, y);
    MapElement(name, inputContainer);

    Redraw();

    return inputContainer;
}

export function CreateImage(x, y, z, image, size, name)
{
    let imageElement = new UI_Image(image, size);

    let imageContainer = CreateContainer(imageElement, x, y, z);
    MapElement(name, imageContainer);

    Redraw();

    return imageContainer;
}