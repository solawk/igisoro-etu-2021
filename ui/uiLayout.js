import
{
    Redraw
} from "../rendering.js";

export function UI_Layout()
{
    this.uiFactoryCalls = [];
}

UI_Layout.prototype.unveil = function(parameters)
{
    for (let call of this.uiFactoryCalls)
    {
        call(parameters);
    }

    Redraw();
}

UI_Layout.prototype.addElementCall = function(elementCall)
{
    this.uiFactoryCalls.push(elementCall);
}