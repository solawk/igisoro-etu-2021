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

        occupationFontSize: 0
    };

AdjustCanvas();

export let VisualElements = new Set();

let resLoadedAmount = 0;
const resAmount = 6;

LoadingScreen();

// Core rendering function
export function Redraw()
{
    AdjustCanvas();

    ctx.drawImage(woodenBack.image, 0, 0);

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

    CanvasSettings.occupationFontSize = Math.floor(CanvasSettings.canvasW / 36);
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

export let Images = new Map;

const woodenBack = new LoadingImage("wood");
const pitImage = new LoadingImage("pit");
const borderImage = new LoadingImage("border");
const seedImage = new LoadingImage("seed");
const arrowImage = new LoadingImage("arrow");
const turnIndicator = new LoadingImage("turn");

let resourcesLoaded = false;

function LoadingUpdate()
{
    resourcesLoaded =
        woodenBack.loaded &&
        pitImage.loaded &&
        borderImage.loaded &&
        seedImage.loaded &&
        turnIndicator.loaded;

    if (resourcesLoaded)
    {
        Redraw();
    }
    else
    {
        LoadingScreen();
    }
}

function LoadingScreen()
{
    ctx.beginPath();
    ctx.rect(0, 0, CanvasSettings.canvasW, CanvasSettings.canvasH);
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillText("Loading resources (" + resLoadedAmount + " of " + resAmount + ")", CanvasSettings.canvasW / 2, CanvasSettings.canvasH / 2);
}