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

export function ElementExists(name)
{
    return VisualElements.get(name) != null;
}

export function GetElement(name)
{
    return VisualElements.get(name).element;
}

export function RemoveElement(name)
{
    VisualElements.delete(name);
    Redraw();
}

export function ChangeButtonText(buttonName, text)
{
    GetElement(buttonName + "Text").text = text;
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

export function CreateText(x, y, z, text, name)
{
    let textContainer = CreateTemporaryText(x, y, z, text);
    MapElement(name, textContainer);

    Redraw();

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