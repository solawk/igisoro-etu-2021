const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
window.onresize = Redraw;

export let CanvasSettings =
    {
        context: ctx,
        dpr: window.devicePixelRatio || 1,
        canvasW: 0,
        canvasH: 0,

        pitSize: 0,
        pitGap: 0,
        pitBorderOffset: 0,

        standardFontSize: 0,
        deratioW: function(ratio) { return ratio * CanvasSettings.canvasW * CanvasSettings.dpr },
        deratioH: function(ratio) { return ratio * CanvasSettings.canvasH * CanvasSettings.dpr }
    };

AdjustCanvas();

export let VisualElements = new Map;
export let Images = new Map;

let resLoadedAmount = 0;

LoadingScreen();

// Core rendering function
export function Redraw()
{
    AdjustCanvas();

    const bgW = canvas.width > Images.get("wood").image.width ? canvas.width : Images.get("wood").image.width;
    const bgH = canvas.height > Images.get("wood").image.width * 9 / 16 ? canvas.height : Images.get("wood").image.width * 9 / 16;
    ctx.drawImage(Images.get("wood").image, 0, 0, bgW, bgH);

    const VisualElementsList = GetElementsSorted(true);

    for (let element of VisualElementsList)
    {
        element.Draw();
    }
}

export function GetElementsSorted(furthest_first)
{
    let VisualElementsList = Array.from(VisualElements.values());
    VisualElementsList.sort(furthest_first ? ZCompareFurthestFirst : ZCompareNearestFirst);
    return VisualElementsList;
}

function ZCompareFurthestFirst(a, b)
{
    return b.z - a.z;
}

function ZCompareNearestFirst(a, b)
{
    return a.z - b.z;
}

function AdjustCanvas()
{
    const DPR = window.devicePixelRatio || 1;
    CanvasSettings.dpr = DPR;

    CanvasSettings.canvasW = window.innerWidth * (9 / 10);
    if (CanvasSettings.canvasW * (9 / 16) > window.innerHeight * (9 / 10))
    {
        CanvasSettings.canvasW = window.innerHeight * (16 / 10);
    }

    CanvasSettings.canvasH = CanvasSettings.canvasW * (9 / 16);
    CanvasSettings.pitSize = CanvasSettings.canvasH * CanvasSettings.dpr / 5;

    CanvasSettings.standardFontSize = CanvasSettings.canvasW * CanvasSettings.dpr / 42;
    CanvasSettings.pitGap = CanvasSettings.pitSize / 10;
    CanvasSettings.pitBorderOffset = CanvasSettings.pitSize / 4;

    canvas.width = CanvasSettings.canvasW * CanvasSettings.dpr;
    canvas.height = CanvasSettings.canvasH * CanvasSettings.dpr;
    canvas.style.borderRadius = (CanvasSettings.canvasW / 50).toString() + "px";
    canvas.style.width = Math.floor(CanvasSettings.canvasW) + "px";
    canvas.style.height = Math.floor(CanvasSettings.canvasH) + "px";

    //CanvasSettings.context.scale(DPR, DPR);
}

// Image loading utils
// Class that loads the src image and raises it's 'loaded' flag when it's loaded, launches LoadingUpdate
function LoadingImage(src, isJpg)
{
    this.loaded = false;

    this.image = new Image();
    this.image.addEventListener("load", function()
    {
        this.loaded = true;
        resLoadedAmount++;
        LoadingUpdate();
    }.bind(this), false);

    const format = isJpg ? ".jpg" : ".png";

    this.image.src = "images/" + src + format;

    Images.set(src, this);
}

new LoadingImage("wood", true);
new LoadingImage("pit");
new LoadingImage("border");
new LoadingImage("seed");
new LoadingImage("arrow");
new LoadingImage("turn");
new LoadingImage("pitHalf");
new LoadingImage("pitGradient");
new LoadingImage("hand");
new LoadingImage("handShadow");

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
    ctx.font = "bold " + CanvasSettings.standardFontSize + "px math";
    ctx.fillText("Loading resources (" + resLoadedAmount + " of " + Images.size + ")", CanvasSettings.canvasW / 2, CanvasSettings.canvasH / 2);
}