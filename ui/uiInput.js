import
{
    CanvasSettings
} from "../rendering.js";

import
{
    gameSettings
} from "../client.js";

import
{
    DrawFrame
} from "./uiFrame.js";

export function UI_Input(length, height, field, type, maxLength)
{
    this.lengthRatio = length;
    this.heightRatio = height;

    this.field = field;
    this.type = type;
    this.maxLength = maxLength;

    this.inputElement = null;
}

UI_Input.prototype.DeployInput = function(x, y)
{
    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("type", this.type);
    this.inputElement.setAttribute("maxLength", this.maxLength);
    this.inputElement.style.position = "absolute";
    this.SetElementPosition(x, y);
    this.inputElement.setAttribute("value", gameSettings[this.field]);

    this.inputElement.style.backgroundColor = "rgba(0,0,0,0)";
    this.inputElement.style.borderColor = "rgba(0,0,0,0)";
    this.inputElement.style.textAlign = "center";
    this.inputElement.style.color = "#ffffff";
    this.inputElement.style.fontFamily = "Georgia";
    this.inputElement.style.fontWeight = "bold";

    document.getElementById("canvasDiv").appendChild(this.inputElement);
}

UI_Input.prototype.RetractInput = function()
{
    gameSettings[this.field] = this.inputElement.value;
    this.inputElement.remove();
}

UI_Input.prototype.SetElementPosition = function(x, y)
{
    if (this.inputElement == null) return;

    this.inputElement.style.left = (document.getElementById("gameCanvas").offsetLeft + (x - this.lengthRatio / 2) * CanvasSettings.canvasW) + 'px';
    this.inputElement.style.top = (document.getElementById("gameCanvas").offsetTop + (y - this.heightRatio / 2) * CanvasSettings.canvasW - (CanvasSettings.deratio(this.heightRatio) / 10)) + 'px';
    this.inputElement.style.width = CanvasSettings.deratio(this.lengthRatio) * 0.95 + 'px';
    this.inputElement.style.height = CanvasSettings.deratio(this.heightRatio) + 'px';
    this.inputElement.style.fontSize = (CanvasSettings.deratio(this.heightRatio) * 0.5) + 'px';

    DrawFrame(x * CanvasSettings.canvasW, y * CanvasSettings.canvasW, CanvasSettings.deratio(this.lengthRatio), CanvasSettings.deratio(this.heightRatio));
}

UI_Input.prototype.Draw = function(x, y)
{
    this.SetElementPosition(x / CanvasSettings.canvasW, y / CanvasSettings.canvasW);
}

UI_Input.prototype.Click = function(x, y)
{
    return false;
}

UI_Input.prototype.Destroy = function()
{
    this.inputElement.remove();
}