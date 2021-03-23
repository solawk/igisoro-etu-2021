const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

export let CanvasSettings =
    {
        context: ctx,
        canvasW: 0,
        canvasH: 0,

        pitSize: 0,
        pitGap: 0,
        pitBorderOffset: 0,

        standardFontSize: 0
    };

AdjustCanvas();

export let VisualElements = new Set;
export let Images = new Map;

let resLoadedAmount = 0;

LoadingScreen();

// Core rendering function
export function Redraw()
{
    AdjustCanvas();

    ctx.drawImage(Images.get("wood").image, 0, 0);

    for (let element of VisualElements)
    {
        element.Draw();
    }
}

function AdjustCanvas()
{
    CanvasSettings.canvasW = window.innerWidth * (9 / 10);
    if (CanvasSettings.canvasW * (9 / 16) > window.innerHeight * (9 / 10))
    {
        CanvasSettings.canvasW = window.innerHeight * (16 / 10);
    }
    CanvasSettings.canvasW *= 0.8;// WIP
    CanvasSettings.canvasH = CanvasSettings.canvasW * (9 / 16);
    CanvasSettings.pitSize = CanvasSettings.canvasH / 5;

    CanvasSettings.standardFontSize = Math.floor(CanvasSettings.canvasW / 36);
    CanvasSettings.pitGap = CanvasSettings.pitSize / 10;
    CanvasSettings.pitBorderOffset = CanvasSettings.pitSize / 4;

    canvas.width = CanvasSettings.canvasW;
    canvas.height = CanvasSettings.canvasH;
    canvas.style.borderRadius = (CanvasSettings.canvasW / 50).toString() + "px";
}

// Image loading utils
// Class that loads the src image and raises it's 'loaded' flag when it's loaded, launches LoadingUpdate
function LoadingImage(src)
{
    this.loaded = false;

    this.image = new Image();
    this.image.addEventListener("load", function()
    {
        this.loaded = true;
        resLoadedAmount++;
        LoadingUpdate();
    }.bind(this), false);
    this.image.src = "images/" + src + ".png";

    Images.set(src, this);
}

new LoadingImage("wood");
new LoadingImage("pit");
new LoadingImage("border");
new LoadingImage("seed");
new LoadingImage("arrow");
new LoadingImage("turn");

function LoadingUpdate()
{
    let resourcesLoaded = IsLoaded();

    if (resourcesLoaded)
    {
        Redraw();
    }
    else
    {
        LoadingScreen();
    }
}

function IsLoaded()
{
    let isLoaded = true;
    for (let [key, res] of Images)
    {
        if (res.loaded === false)
        {
            isLoaded = false;
        }
    }

    return isLoaded;
}

function LoadingScreen()
{
    ctx.beginPath();
    ctx.rect(0, 0, CanvasSettings.canvasW, CanvasSettings.canvasH);
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillText("Loading resources (" + resLoadedAmount + " of " + Images.size + ")", CanvasSettings.canvasW / 2, CanvasSettings.canvasH / 2);
}